import React, { useState, useCallback, useRef, useEffect } from "react";
import { MessageInput } from "./MessageInput";
import {
  useMessages,
  useSendMessage,
  useStreamMessages,
} from "@xmtp/react-sdk";
import MessageItem from "./MessageItem";

const styles = {
  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  messagesList: {
    paddingLeft: "10px",
    paddingRight: "10px",
    margin: "0px",
    alignItems: "flex-start",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
};

export const MessageContainer = ({ conversation, client }) => {
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { messages } = useMessages(conversation);
  const [streamedMessages, setStreamedMessages] = useState([]);

  const onMessage = useCallback(
    (message) => {
      setStreamedMessages((prev) => [...prev, message]);
    },
    [streamedMessages],
  );

  useStreamMessages(conversation, { onMessage });
  const { sendMessage } = useSendMessage();

  useEffect(() => {
    setStreamedMessages([]);
  }, [conversation]);

  const handleSendMessage = async (newMessage) => {
    if (!newMessage.trim()) {
      alert("empty message");
      return;
    }
    if (conversation && conversation.peerAddress) {
      await sendMessage(conversation, newMessage);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.messagesContainer}>
      {isLoading ? (
        <small className="loading">Loading messages...</small>
      ) : (
        <>
          <ul style={styles.messagesList}>
            {messages.slice().map((message) => {
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
          <MessageInput
            onSendMessage={(msg) => {
              handleSendMessage(msg);
            }}
          />
        </>
      )}
    </div>
  );
};
