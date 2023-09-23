import React, { useState, useCallback } from "react";
import { useConversations, useStreamConversations } from "@xmtp/react-sdk";
import styled from "styled-components";

export const ListConversations = ({ selectConversation }) => {
  const { conversations } = useConversations();

  const [streamedConversations, setStreamedConversations] = useState([]);

  // callback to handle incoming conversations
  const onConversation = useCallback((conversation: Conversation) => {
    setStreamedConversations((prev) => [...prev, conversation]);
  }, []);
  const { error } = useStreamConversations(onConversation);

  const getRelativeTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diff / 1000 / 60);
    const diffHours = Math.floor(diff / 1000 / 60 / 60);
    const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
    const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

    if (diffSeconds < 60) {
      return "now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <>
      {conversations.map((conversation, index) => (
        <ConversationListItem
          key={index}
          onClick={() => {
            selectConversation(conversation);
          }}>
          <ConversationDetails>
            <ConversationName>
              {conversation.peerAddress.substring(0, 6) +
                "..." +
                conversation.peerAddress.substring(
                  conversation.peerAddress.length - 4,
                )}
            </ConversationName>
            <MessagePreview>...</MessagePreview>
          </ConversationDetails>
          <ConversationTimestamp>
            {getRelativeTimeLabel(conversation.createdAt)}
          </ConversationTimestamp>
        </ConversationListItem>
      ))}
    </>
  );
};

const ConversationListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  background-color: #f0f0f0;
  padding: 10px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: lightblue;
  }
`;

const ConversationDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 75%;
  margin-left: 10px;
  overflow: hidden;
`;

const ConversationName = styled.span`
  font-size: 16px;
  font-weight: bold;
`;

const MessagePreview = styled.span`
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationTimestamp = styled.div`
  font-size: 12px;
  color: #999;
  width: 25%;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
`;
