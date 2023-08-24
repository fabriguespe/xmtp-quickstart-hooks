import React, { useState, useEffect, useCallback } from "react";
import Chat from "./Chat";
import styles from "./Home.module.css";
import { ethers } from "ethers";

import {
  useStreamMessages,
  useClient,
  useConversations,
  useCanMessage,
  useStartConversation,
} from "@xmtp/react-sdk";

const PEER_ADDRESS = "0x937C0d4a6294cdfa575de17382c7076b579DC176"; //gm bot

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  //Other

  //React SDKs
  const { client, initialize } = useClient();
  const { canMessage } = useCanMessage();
  const { conversations, error, isLoading } = useConversations();
  const { startConversation } = useStartConversation();
  const [history, setHistory] = useState(null);
  //Conversation
  const [conversation, setConversation] = useState(null); // Conditional use of useMessages based on conversation
  //const { messages } = useMessages(conversation);
  //Messages
  const [messages, setMessages] = useState(null);
  const onMessage = useCallback((message) => {
    setHistory((prevMessages) => {
      const msgsnew = [...prevMessages, message];
      return msgsnew;
    });
  }, []);
  useStreamMessages(conversation, onMessage);

  //Initialize XM

  const initXmtp = async () => {
    await initialize({ signer });
  };

  useEffect(() => {
    async function loadConversation() {
      if (await canMessage(PEER_ADDRESS)) {
        console.log("entra");
        console.log(conversations);
        const conversation = await startConversation(PEER_ADDRESS, "hi");
        setConversation(conversation.conversation);
        console.log(conversation.conversation);
        const history = await conversation.conversation.messages();
        console.log("history", history.length);
        setHistory(history);
      } else {
        console.log("cant message because is not on the network.");
        //cant message because is not on the network.
      }
    }
    if (!conversation && client) loadConversation();
  }, [signer, client]);

  const connectWallet = async function () {
    // Check if the ethereum object exists on the window object
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request access to the user's Ethereum accounts
        await window.ethereum.enable();

        // Instantiate a new ethers provider with Metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Get the signer from the ethers provider
        setSigner(provider.getSigner());

        // Update the isConnected data property based on whether we have a signer
        setIsConnected(true);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      console.error("Metamask not found");
    }
  };
  return (
    <div className={styles.Home}>
      {/* Display the ConnectWallet component if not connected */}
      {!isConnected && (
        <div className={styles.xmtp}>
          <button onClick={connectWallet} className={styles.btnXmtp}>
            Connect Wallet
          </button>
        </div>
      )}
      {/* Display XMTP connection options if connected but not initialized */}
      {isConnected && !client && (
        <div className={styles.xmtp}>
          <button onClick={initXmtp} className={styles.btnXmtp}>
            Connect to XMTP
          </button>
        </div>
      )}
      {isConnected && history && (
        <Chat
          conversation={conversation}
          messageHistory={history}
          signer={signer}
        />
      )}
    </div>
  );
}
