import { storage } from "./storage";
import * as whatsappManager from "./whatsappManager";
import { logSystemEvent } from "./logManager";

// Track running broadcasts
const runningBroadcasts = new Map<string, NodeJS.Timeout>();

export async function processBroadcast(broadcastId: string) {
  console.log(`[Broadcast] Starting processor for broadcast ${broadcastId}`);
  logSystemEvent('broadcast', 'info', `Iniciando disparo ${broadcastId}`, { broadcastId });

  // Check if already running
  if (runningBroadcasts.has(broadcastId)) {
    console.log(`[Broadcast] Already running for ${broadcastId}`);
    return;
  }

  const runLoop = async () => {
    try {
      const broadcast = await storage.getBroadcast(broadcastId);

      if (!broadcast) {
        console.log(`[Broadcast] Broadcast ${broadcastId} not found, stopping`);
        stopBroadcast(broadcastId);
        return;
      }

      // Stop if paused or completed
      if (broadcast.status === 'paused') {
        console.log(`[Broadcast] Broadcast ${broadcastId} paused`);
        stopBroadcast(broadcastId);
        return;
      }

      if (broadcast.status === 'completed' || broadcast.status === 'failed') {
        console.log(`[Broadcast] Broadcast ${broadcastId} finished`);
        logSystemEvent('broadcast', 'info', `Disparo ${broadcastId} finalizado`, { status: broadcast.status });
        stopBroadcast(broadcastId);
        return;
      }

      // Get next pending contact
      const contacts = await storage.getBroadcastContacts(broadcastId);
      const nextContact = contacts.find(c => c.status === 'pending');

      if (!nextContact) {
        // All contacts processed
        await storage.updateBroadcast(broadcastId, {
          status: 'completed',
          completedAt: new Date(),
        });
        console.log(`[Broadcast] All contacts processed for ${broadcastId}`);
        logSystemEvent('broadcast', 'info', `Disparo ${broadcastId} concluído com sucesso`, { broadcastId });
        stopBroadcast(broadcastId);
        return;
      }

      // Check if contact phone is valid
      if (!nextContact.contactPhone) {
        console.error(`[Broadcast] Invalid contact phone for contact ID ${nextContact.id}`);
        await storage.updateBroadcastContact(nextContact.id, {
          status: 'failed',
          errorMessage: 'Invalid phone number',
        });
        // Update broadcast failed count
        await storage.updateBroadcast(broadcastId, {
          failedCount: broadcast.failedCount + 1,
        });
        // Schedule next immediately since we didn't send
        const timeout = setTimeout(runLoop, 100);
        runningBroadcasts.set(broadcastId, timeout);
        return;
      }

      // Send message
      console.log(`[Broadcast] Sending message to ${nextContact.contactPhone}`);

      try {
        const sent = await whatsappManager.sendWhatsAppMessage(
          broadcast.deviceId,
          nextContact.contactPhone,
          broadcast.message,
          broadcast.mediaUrl,
          broadcast.mediaType,
          broadcast.mediaUrls,
          broadcast.mediaTypes
        );

        if (sent) {
          // Update contact status to sent
          await storage.updateBroadcastContact(nextContact.id, {
            status: 'sent',
            sentAt: new Date(),
          });

          // Update broadcast sent count
          await storage.updateBroadcast(broadcastId, {
            sentCount: broadcast.sentCount + 1,
          });

          console.log(`[Broadcast] Message sent successfully to ${nextContact.contactPhone}`);
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error: any) {
        console.error(`[Broadcast] Error sending to ${nextContact.contactPhone}:`, error);
        logSystemEvent('broadcast', 'error', `Erro ao enviar para ${nextContact.contactPhone}`, { error: error.message, broadcastId });

        await storage.updateBroadcastContact(nextContact.id, {
          status: 'failed',
          errorMessage: error.message || 'Failed to send',
        });

        await storage.updateBroadcast(broadcastId, {
          failedCount: broadcast.failedCount + 1,
        });
      }

      // Schedule next with delay
      const delay = (broadcast.delay || 20) * 1000;
      const timeout = setTimeout(runLoop, delay);
      runningBroadcasts.set(broadcastId, timeout);

    } catch (error) {
      console.error(`[Broadcast] Critical error in processor:`, error);
      stopBroadcast(broadcastId);
    }
  };

  // Start the loop
  runLoop();
}

export function stopBroadcast(broadcastId: string) {
  const timeout = runningBroadcasts.get(broadcastId);
  if (timeout) {
    clearTimeout(timeout);
    runningBroadcasts.delete(broadcastId);
    console.log(`[Broadcast] Stopped processor for ${broadcastId}`);
  }
}
