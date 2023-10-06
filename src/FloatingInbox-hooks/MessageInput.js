import React, { useState } from "react";

const styles = {
  newMessageContainer: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "10px",
    paddingRight: "10px",
    flexWrap: "wrap",
  },
  messageInputField: {
    flexGrow: 1,
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  sendButton: {
    padding: "5px 10px",
    marginLeft: "5px",
    border: "1px solid #ccc",
    cursor: "pointer",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
  },
};

export const MessageInput = ({ onSendMessage, replyingToMessage }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleInputChange = (event) => {
    if (event.key === "Enter") {
      onSendMessage(newMessage);
      setNewMessage("");
    } else {
      setNewMessage(event.target.value);
    }
  };

  return (
    <div style={styles.newMessageContainer}>
      <input
        style={styles.messageInputField}
        type="text"
        value={newMessage}
        onKeyPress={handleInputChange}
        onChange={handleInputChange}
        placeholder="Type your message..."
      />
      <button
        style={styles.sendButton}
        onClick={() => {
          onSendMessage(newMessage);
          setNewMessage("");
        }}>
        Send
      </button>
    </div>
  );
};
