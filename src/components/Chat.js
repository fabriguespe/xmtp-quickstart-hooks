import React, { useState } from "react";
import {
  AttachmentCodec,
  RemoteAttachmentCodec,
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
} from "xmtp-content-type-remote-attachment";
import styles from "./Chat.module.css";

function Chat({ messageHistory, conversation, address }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [image, setImage] = useState(false);

  // Function to handle sending a message
  const handleSend = async () => {
    if (inputValue) {
      if (image) {
        // Check if the file size is larger than 1MB
        if (image.size > 1024 * 1024) {
          console.log("Sending large file:", inputValue);
          await handleLargeFile(image);
        } else {
          console.log("Sending small file:", inputValue);
          await handleSmallFile(image);
        }
      } else {
        // Handle text input
        console.log("Sending text:", inputValue);
        await onSendMessage(inputValue);
      }
      setImage(false);
      setIsLoading(false);
      setInputValue("");
    }
  };

  // Function to handle sending a small file attachment
  const handleSmallFile = async (file) => {
    // Convert the file to a Uint8Array
    const blob = new Blob([file], { type: "image/png" });
    let imgArray = new Uint8Array(await blob.arrayBuffer());

    const attachment = {
      filename: file.name,
      mimeType: "image/png",
      data: imgArray,
    };
    await conversation.send(attachment, { contentType: ContentTypeAttachment });
  };

  // Function to handle sending a large file attachment
  const handleLargeFile = async (file) => {
    setIsLoading(true);
    const uploadUrl = await upload({
      data: [file],
      options: { uploadWithGatewayUrl: true, uploadWithoutDirectory: true },
    });
    setLoadingText(uploadUrl[0]);

    const attachment = {
      filename: file.name,
      mimeType: "image/png",
      data: new TextEncoder().encode("hello world"),
    };

    const encryptedAttachment = await RemoteAttachmentCodec.encodeEncrypted(
      attachment,
      new AttachmentCodec(),
    );

    const remoteAttachment = {
      url: uploadUrl[0],
      contentDigest: encryptedAttachment.digest,
      salt: encryptedAttachment.salt,
      nonce: encryptedAttachment.nonce,
      secret: encryptedAttachment.secret,
      scheme: "https://",
      filename: attachment.filename,
      contentLength: attachment.data.byteLength,
    };

    setLoadingText("Sending...");
    await conversation.send(remoteAttachment, {
      contentType: ContentTypeRemoteAttachment,
      contentFallback: "a screenshot of over 1MB",
    });
  };

  // Function to handle sending a text message
  const onSendMessage = async (value) => {
    return conversation.send(value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setInputValue(file.name);
    setImage(file);
  };
  // Function to handle dropping a file onto the input field
  const handleFileDrop = (event) => {
    event.preventDefault();
    console.log(event.dataTransfer.files);
    const file = event.dataTransfer.files[0];
    setInputValue(file.name);
    setImage(file);
  };
  // Function to handle input change (keypress or change event)
  const handleInputChange = (event) => {
    if (event.key === "Enter") {
      handleSend();
    } else {
      setInputValue(event.target.value);
      setImage(false); // Clear the image state when typing
    }
  };

  // Function to handle the drag-over event
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Function to handle the click event on a message
  const handleClick = (message) => {
    alert("Check the console for the message details");
    console.log(message);
  };

  // Function to render a remote attachment URL as an image
  const remoteURL = (attachment) => {
    return (
      <img
        src={attachment?.url}
        width={200}
        className="imageurl"
        alt={attachment?.filename}
      />
    );
  };

  // Function to render a local attachment as an image
  const objectURL = (attachment) => {
    if (attachment?.data) {
      const blob = new Blob([attachment?.data], { type: attachment?.mimeType });
      return (
        <img
          src={URL.createObjectURL(blob)}
          width={200}
          className="imageurl"
          alt={attachment?.filename}
        />
      );
    }
  };

  // MessageList component to render the list of messages
  const MessageList = ({ messages }) => {
    // Filter messages by unique id
    messages = messages.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
    );

    return (
      <ul className="messageList">
        {messages.map((message, index) => (
          <li
            key={message.id}
            className="messageItem"
            title="Click to log this message to the console">
            <strong>
              {message.senderAddress === address ? "You" : "Bot"}:
            </strong>
            {(() => {
              if (message.contentType.sameAs(ContentTypeRemoteAttachment)) {
                // Handle ContentTypeRemoteAttachment
                return remoteURL(message.content);
              } else if (message.contentType.sameAs(ContentTypeAttachment)) {
                // Handle ContentTypeAttachment
                return objectURL(message.content);
              } else {
                // Handle other content types (e.g., text messages)
                return <span>{message.content}</span>;
              }
            })()}
            <span className="date"> ({message.sent.toLocaleTimeString()})</span>
            <span className="eyes" onClick={() => handleClick(message)}>
              👀
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const triggerFileInput = () => {
    document.getElementById("image-upload").click();
  };
  return (
    <div className={styles.Chat}>
      <div className={styles.messageContainer}>
        <MessageList messages={messageHistory} />
      </div>
      <div
        className={styles.inputContainer}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}>
        {isLoading ? (
          <div className={styles.inputField}>{loadingText}</div>
        ) : image ? (
          <div className={styles.inputField}>{inputValue}</div>
        ) : (
          <input
            type="text"
            className={styles.inputField}
            onKeyPress={handleInputChange}
            onChange={handleInputChange}
            value={inputValue}
            placeholder="Type your text here or drop an image"
          />
        )}
        <button className={styles.sendButton} onClick={triggerFileInput}>
          📤
        </button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          &#128073;
        </button>
      </div>
    </div>
  );
}

export default Chat;
