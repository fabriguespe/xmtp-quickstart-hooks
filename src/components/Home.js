import { ConnectWallet } from "@thirdweb-dev/react";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { Client } from "@xmtp/xmtp-js";

import React, { useEffect, useState, useRef } from "react";
import Chat from "./Chat";
import {
  AttachmentCodec,
  RemoteAttachmentCodec
} from "xmtp-content-type-remote-attachment";
import styles from "./Home.module.css";

const PEER_ADDRESS = '0x937C0d4a6294cdfa575de17382c7076b579DC176';

export default function Home() {
  const [messages, setMessages] = useState(null);
  const convRef = useRef(null);
  const address = useAddress();
  const signer = useSigner();
  const isConnected = !!signer;
  const [xmtpConnected, setXmtpConnected] = useState(false);

  // Function to load the existing messages in a conversation
  const newConversation = async function (xmtp_client,addressTo) {
    //Checks if the address is on the network
    if(xmtp_client.canMessage(addressTo)){
      //Creates a new conversation with the address
      const conversation = await xmtp_client.conversations.newConversation(addressTo);
      convRef.current = conversation;
      //Loads the messages of the conversation
      const messages = await conversation.messages();
      setMessages(messages);
    }else{
      console.log("cant message because is not on the network.");
      //cant message because is not on the network.
    }
  };

  // Function to initialize the XMTP client
  const initXmtp = async function () {
    // Create the XMTP client
    const xmtp = await Client.create(signer, { env: "production" });
    // Register the codecs. AttachmentCodec is for local attachments (<1MB)
    xmtp.registerCodec(new AttachmentCodec());
    //RemoteAttachmentCodec is for remote attachments (>1MB) using thirdweb storage
    xmtp.registerCodec(new RemoteAttachmentCodec());
    //Create or load conversation with Gm bot
    newConversation(xmtp,PEER_ADDRESS);
    // Set the XMTP client in state for later use
    setXmtpConnected(!!xmtp.address);
  };

  useEffect(() => {
    console.log('je')
    if (xmtpConnected && convRef.current) {
      // Function to stream new messages in the conversation
      const streamMessages = async () => {
        const newStream = await convRef.current.streamMessages();
        for await (const msg of newStream) {
          const exists = messages.find(m => m.id === msg.id);
          if (!exists) {
            setMessages(prevMessages => {
              const msgsnew = [...prevMessages, msg];
              return msgsnew;
            });
          }
        }
      };
      streamMessages();
    }
  }, [messages, xmtpConnected]);

  return (
    
    <div className={styles.Home}>
      {/* Display the ConnectWallet component if not connected */}
      {!isConnected && (
        <div className={styles.thirdWeb}>
          <img src='thirdweb-logo-transparent-white.svg' alt='Your image description' width={200} />
          <ConnectWallet theme="dark" />
        </div>
      )}
      {/* Display XMTP connection options if connected but not initialized */}
      {isConnected && !xmtpConnected && (
        <div className={styles.xmtp}>
          <ConnectWallet theme="light" />
          <button className="btn" style={({ margin: '10px' })}>Connect to XMTP</button>
          <img onClick={initXmtp} src='logomark.svg' alt='Your image description' width={200} className={styles.xmtpImg} />
        </div>
      )}
      {/* Render the Chat component if connected, initialized, and messages exist */}
      {isConnected && xmtpConnected && messages && (
        <Chat  conversation={convRef.current} messageHistory={messages} />
      )}
    </div>
  );
}
