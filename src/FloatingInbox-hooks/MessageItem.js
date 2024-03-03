import React from "react";
import { useClient } from "@xmtp/react-sdk";

const MessageItem = ({ message, senderAddress, isPWA = false }) => {
  const { client } = useClient();
  const styles = {
    messageContent: {
      backgroundColor: "lightblue",
      padding: isPWA == true ? "10px 20px" : "5px 10px",
      alignSelf: "flex-start",
      textAlign: "left",
      display: "inline-block",
      margin: isPWA == true ? "10px" : "5px",
      borderRadius: isPWA == true ? "10px" : "5px",
      maxWidth: "80%",
      wordBreak: "break-word",
      cursor: "pointer",
      listStyle: "none",
    },
    renderedMessage: {
      fontSize: isPWA == true ? "16px" : "12px",
      wordBreak: "break-word",
      padding: "0px",
    },
    senderMessage: {
      alignSelf: "flex-start",
      textAlign: "left",
      listStyle: "none",
      width: "100%",
    },
    receiverMessage: {
      alignSelf: "flex-end",
      listStyle: "none",
      textAlign: "right",
      width: "100%",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    timeStamp: {
      fontSize: isPWA == true ? "12px" : "8px",
      color: "grey",
    },
  };

  const renderFooter = (timestamp) => {
    return (
      <div style={styles.footer}>
        <span style={styles.timeStamp}>
          {`${new Date(timestamp).getHours()}:${String(
            new Date(timestamp).getMinutes()
          ).padStart(2, "0")}`}
        </span>
      </div>
    );
  };
  const renderMessage = (message) => {
    console.log(message);
    const date = message.sentAt ? message.sentAt : message.sent;
    try {
      if (message?.content.length > 0) {
        return (
          <div style={styles.messageContent}>
            <div style={styles.renderedMessage}>{message?.content}</div>
            {renderFooter(date)}
          </div>
        );
      }
    } catch {
      return message?.fallbackContent ? (
        <div style={styles.messageContent}>
          <div style={styles.renderedMessage}>{message?.fallbackContent}</div>
          {renderFooter(date)}
        </div>
      ) : null;
    }
  };

  const isSender = senderAddress === client?.address;

  const MessageComponent = isSender ? "li" : "li";

  return (
    <MessageComponent
      style={isSender ? styles.senderMessage : styles.receiverMessage}
      key={message.id}
    >
      {renderMessage(message)}
    </MessageComponent>
  );
};
export default MessageItem;
