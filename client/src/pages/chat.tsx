import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Search, MoreVertical, RefreshCw } from "lucide-react";
// ... imports

export default function Chat() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: devices } = useQuery<any[]>({
    queryKey: ['/api/devices'],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
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

  // ... (rest of the component)

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
                    contactId={conversation.contactId}
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
                  contactId={selectedConversation.contactId}
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
