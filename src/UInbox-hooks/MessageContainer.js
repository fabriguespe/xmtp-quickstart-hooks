import React, { useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import { MessageInput } from "./MessageInput";
import {
  useMessages,
  useSendMessage,
  useStreamMessages,
} from "@xmtp/react-sdk";
import MessageItem from "./MessageItem";

export const MessageContainer = ({
  conversation,
  client,
  searchTerm,
  selectConversation,
}) => {
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { messages } = useMessages(conversation);
  const [streamedMessages, setStreamedMessages] = useState([]);

  // callback to handle incoming messages
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
    } else if (conversation) {
      const conv = await client.conversations.newConversation(searchTerm);
      selectConversation(conv);
      await sendMessage(conversation, newMessage);
    }
  };

  const scrollToLatestMessage = () => {
    const element = messagesEndRef.current;
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToLatestMessage, [messages]);

  return (
    <MessagesContainer>
      {isLoading ? (
        <small className="loading">Loading messages...</small>
      ) : (
        <>
          <MessagesList>
            {messages.map((message) => {
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
          </MessagesList>
          <MessageInput
            onSendMessage={(msg) => {
              handleSendMessage(msg);
            }}
          />
        </>
      )}
    </MessagesContainer>
  );
};

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const MessagesList = styled.ul`
  padding-left: 10px;
  padding-right: 10px;
  margin: 0px;
  align-items: flex-start;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;
