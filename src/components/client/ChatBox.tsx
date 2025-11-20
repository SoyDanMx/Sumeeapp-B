"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Message {
  id: string;
  lead_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatBoxProps {
  leadId: string;
  currentUserId: string | null;
}

export default function ChatBox({ leadId, currentUserId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar mensajes iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!leadId) return;

    let subscription: any = null;

    const loadMessagesAndSubscribe = async () => {
      try {
        setIsLoading(true);

        // Cargar mensajes iniciales
        const { data: initialMessages, error: fetchError } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: true });

        if (fetchError) {
          console.error("Error loading messages:", fetchError);
          return;
        }

        setMessages(initialMessages || []);

        // Suscribirse a nuevos mensajes en tiempo real
        subscription = supabase
          .channel(`lead:${leadId}:messages`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `lead_id=eq.${leadId}`,
            },
            (payload) => {
              const newMessage = payload.new as Message;
              setMessages((prev) => [...prev, newMessage]);
            }
          )
          .subscribe();

        setIsLoading(false);
      } catch (error) {
        console.error("Error in loadMessagesAndSubscribe:", error);
        setIsLoading(false);
      }
    };

    loadMessagesAndSubscribe();

    // Cleanup: cancelar suscripción cuando el componente se desmonte
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [leadId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending || !currentUserId) return;

    try {
      setIsSending(true);

      const { error } = await supabase
        .from("messages")
        .insert([{
          lead_id: leadId,
          sender_id: currentUserId,
          content: newMessage.trim(),
        }] as any);

      if (error) {
        console.error("Error sending message:", error);
        alert("Error al enviar el mensaje. Intenta de nuevo.");
      } else {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      alert("Error al enviar el mensaje. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;

    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[500px] flex flex-col">
      {/* Header del chat */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="font-semibold text-gray-900">Chat de la Solicitud</h3>
        <p className="text-xs text-gray-600">Mensajes en tiempo real</p>
      </div>

      {/* Área de mensajes */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-blue-600 text-2xl"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No hay mensajes aún. Comienza la conversación.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input para escribir mensajes */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              currentUserId
                ? "Escribe un mensaje..."
                : "Inicia sesión para enviar mensajes"
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSending || !currentUserId}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || !currentUserId}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              newMessage.trim() && !isSending && currentUserId
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
