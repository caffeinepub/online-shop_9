import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMessages, useSendMessage } from "../hooks/useQueries";

interface ProductChatProps {
  productId: string;
}

function formatTime(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(ms));
}

export function ProductChat({ productId }: ProductChatProps) {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: messages = [], isLoading } = useMessages(productId);
  const { mutateAsync: sendMessage, isPending: sending } = useSendMessage();

  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when message count changes - stored in ref to avoid exhaustive-deps
  const messageCountRef = useRef(0);
  if (messages.length !== messageCountRef.current) {
    messageCountRef.current = messages.length;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const senderName = identity
      ? `${identity.getPrincipal().toString().slice(0, 10)}…`
      : "Аноним";

    try {
      await sendMessage({ productId, senderName, text: trimmed });
      setText("");
    } catch {
      toast.error("Не удалось отправить сообщение");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-10 border-t border-border pt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">
          Написать продавцу
        </h2>
      </div>

      {/* Messages area */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {isLoading ? (
          <div className="p-4 space-y-3" data-ocid="chat.loading_state">
            {[1, 2, 3].map((k) => (
              <div key={k} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="chat.empty_state"
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Пока нет сообщений. Будьте первым!</p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div
              ref={scrollRef}
              className="p-4 space-y-3 max-h-72 overflow-y-auto"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3"
                  data-ocid={`chat.message.${i + 1}`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                    {msg.senderName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground truncate max-w-36">
                        {msg.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Input area */}
        <div className="border-t border-border p-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Написать сообщение…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                className="flex-1"
                data-ocid="chat.input"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={sending || !text.trim()}
                data-ocid="chat.send_button"
                className="shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Войдите, чтобы написать продавцу
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={login}
                data-ocid="chat.send_button"
              >
                Войти
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
