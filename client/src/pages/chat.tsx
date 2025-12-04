import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Search, MoreVertical, RefreshCw, Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ContactAvatar } from "@/components/ContactAvatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Conversation } from "@shared/schema";

export default function Chat() {
  console.log("Chat component rendering");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // ... queries ...

  const sendAudioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      if (!selectedConversationId) return;

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('type', 'audio');

      // Usar fetch direto pois apiRequest é para JSON
      const res = await fetch(`/api/conversations/${selectedConversationId}/messages/media`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Falha ao enviar áudio");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedConversationId}/messages`] });
      toast({ title: "Áudio enviado!" });
    },
    onError: () => {
      toast({ title: "Erro ao enviar áudio", variant: "destructive" });
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMutation.mutateAsync(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({ title: "Erro ao acessar microfone. Verifique as permissões.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const { data: devices } = useQuery<any[]>({
    queryKey: ['/api/devices'],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    refetchInterval: 3000, // Auto-refresh every 3 seconds to show new messages
  });

  const syncContactsMutation = useMutation({
    mutationFn: async () => {
      if (!devices) return;
      const connectedDevices = devices.filter((d: any) => d.connectionStatus === 'connected');

      if (connectedDevices.length === 0) {
        throw new Error("Nenhum dispositivo conectado");
      }

      await Promise.all(connectedDevices.map((device: any) =>
        apiRequest("POST", `/api/whatsapp/sync-contacts/${device.id}`)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      toast({ title: "Contatos sincronizados com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao sincronizar",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  });

  const filteredConversations = conversations?.filter(c =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPhone.includes(searchQuery)
  ) || [];

  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

  const { data: messages, isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: [`/api/conversations/${selectedConversationId}/messages`],
    enabled: !!selectedConversationId,
    refetchInterval: 3000, // Poll for new messages
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) return;
      await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedConversationId}/messages`] });
      setMessageText("");
    },
    onError: () => {
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    }
  });

  const toggleTranscriptionMutation = useMutation({
    mutationFn: async (shouldTranscribe: boolean) => {
      if (!selectedConversation?.deviceId) return;
      await apiRequest("PATCH", `/api/devices/${selectedConversation.deviceId}/settings`, { shouldTranscribe });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      toast({ title: "Configuração atualizada!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar configuração", variant: "destructive" });
    }
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-full md:w-96 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Conversas</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => syncContactsMutation.mutate()}
              disabled={syncContactsMutation.isPending}
              title="Sincronizar nomes dos contatos"
            >
              <RefreshCw className={cn("h-4 w-4", syncContactsMutation.isPending && "animate-spin")} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 text-left",
                    selectedConversationId === conversation.id && "bg-accent"
                  )}
                  data-testid={`conversation-item-${conversation.id}`}
                >
                  <ContactAvatar
                    deviceId={conversation.deviceId}
                    contactId={conversation.contactPhone}
                    name={conversation.contactName}
                    className="h-12 w-12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium truncate">{conversation.contactName}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.contactPhone}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="shrink-0 h-5 min-w-5 px-1.5">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ContactAvatar
                  deviceId={selectedConversation.deviceId}
                  contactId={selectedConversation.contactPhone}
                  name={selectedConversation.contactName}
                />
                <div>
                  <p className="font-medium" data-testid="text-contact-name">
                    {selectedConversation.contactName}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-contact-phone">
                    {selectedConversation.contactPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mr-2">
                <Switch
                  id="auto-transcribe"
                  checked={devices?.find(d => d.id === selectedConversation.deviceId)?.shouldTranscribe ?? true}
                  onCheckedChange={(checked) => toggleTranscriptionMutation.mutate(checked)}
                />
                <Label htmlFor="auto-transcribe" className="text-xs text-muted-foreground cursor-pointer">
                  Auto Transcrever
                </Label>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-3/4" />
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.direction === 'outgoing' ? "justify-end" : "justify-start"
                      )}
                      data-testid={`message-${message.id}`}
                    >
                      <div
                        className={cn(
                          "max-w-md rounded-2xl px-4 py-2",
                          message.direction === 'outgoing'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.mediaUrl && message.mediaType?.startsWith('image/') && (
                          <img
                            src={message.mediaUrl}
                            alt="Mídia"
                            className="rounded-lg mb-2 max-w-full h-auto"
                            style={{ maxHeight: '300px' }}
                          />
                        )}
                        {message.mediaUrl && message.mediaType?.startsWith('audio/') && (
                          <audio controls className="w-full mb-2">
                            <source src={message.mediaUrl} type={message.mediaType} />
                            Seu navegador não suporta áudio.
                          </audio>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {message.isFromBot && (
                            <Badge variant="secondary" className="h-4 text-xs px-1">
                              Bot
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (messageText.trim()) {
                    sendMessageMutation.mutate(messageText);
                  }
                }}
                className="flex gap-2"
              >
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "secondary"}
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn("shrink-0", isRecording && "animate-pulse")}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  type="submit"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm text-muted-foreground">
                Escolha uma conversa na lista para começar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
