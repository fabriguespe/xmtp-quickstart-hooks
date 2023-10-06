import React, { useState, useCallback } from "react";
import { useConversations, useStreamConversations } from "@xmtp/react-sdk";

export const ListConversations = ({
  client,
  searchTerm,
  selectConversation,
  onConversationFound,
}) => {
  const { conversations } = useConversations();
  const [streamedConversations, setStreamedConversations] = useState([]);

  const styles = {
    conversationListItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer",
      backgroundColor: "#f0f0f0",
      padding: "10px",
      transition: "background-color 0.3s ease",
      ":hover": {
        backgroundColor: "lightblue",
      },
    },
    conversationDetails: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "75%",
      marginLeft: "10px",
      overflow: "hidden",
    },
    conversationName: {
      fontSize: "16px",
      fontWeight: "bold",
    },
    messagePreview: {
      fontSize: "14px",
      color: "#666",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    conversationTimestamp: {
      fontSize: "12px",
      color: "#999",
      width: "25%",
      textAlign: "right",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation?.peerAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      conversation?.peerAddress !== client.address,
  );
  if (filteredConversations.length > 0) {
    onConversationFound(true);
  }
  const onConversation = useCallback((conversation: Conversation) => {
    setStreamedConversations((prev) => [...prev, conversation]);
  }, []);
  const { error } = useStreamConversations(onConversation);

  const getRelativeTimeLabel = (dateString) => {
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
      {filteredConversations.map((conversation, index) => (
        <li
          key={index}
          style={styles.conversationListItem}
          onClick={() => {
            selectConversation(conversation);
          }}>
          <div style={styles.conversationDetails}>
            <span style={styles.conversationName}>
              {conversation.peerAddress.substring(0, 6) +
                "..." +
                conversation.peerAddress.substring(
                  conversation.peerAddress.length - 4,
                )}
            </span>
            <span style={styles.messagePreview}>...</span>
          </div>
          <div style={styles.conversationTimestamp}>
            {getRelativeTimeLabel(conversation.createdAt)}
          </div>
        </li>
      ))}
    </>
  );
};
