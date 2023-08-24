import React, { useState, useEffect, useCallback } from "react";
import Chat from "./Chat";
import styles from "./Home.module.css";
import { ethers } from "ethers";
import { loadKeys, storeKeys, getEnv } from "./helpers";

import {
  Client,
  useStreamMessages,
  useStreamAllMessages,
  useClient,
  useConversations,
  useCanMessage,
  useStartConversation,
} from "@xmtp/react-sdk";

const PEER_ADDRESS = "0x7E0b0363404751346930AF92C80D1fef932Cc48a"; //gm bot

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { client, initialize } = useClient();
  const { canMessage } = useCanMessage();
  const { conversations, error, isLoading } = useConversations();
  const { startConversation } = useStartConversation();
  const [history, setHistory] = useState(null);
  //Conversation
  const [conversation, setConversation] = useState(null);
  //Messages
  const [messages, setMessages] = useState(null);
  //const { messages } = useMessages(conversation); @ry is not working because conversation is null

  //Stream
  const onMessage = useCallback(
    (message) => {
      if (message.conversation.peerAddress !== conversation?.peerAddress)
        return;
      setHistory((prev) => [...prev, message]);
    },
    [conversation],
  );
  useStreamAllMessages(onMessage);
  //useStreamMessages(conversation, onMessage); // @ry is not working because conversation is null

  //Initialize XMTP
  const initXmtpWithKeys = async () => {
    const options = {
      env: getEnv(),
    };
    console.log(address);
    let keys = loadKeys(address);
    if (!keys) {
      keys = await Client.getKeys(signer, {
        options,
        skipContactPublishing: true,
        persistConversations: false,
      });
      storeKeys(address, keys);
    }

    await initialize({ keys, options, signer });
  };

  useEffect(() => {
    async function loadConversation() {
      if (await canMessage(PEER_ADDRESS)) {
        console.log("entra");
        console.log(conversations);
        const { conversation } = await startConversation(PEER_ADDRESS, "hi");
        setConversation(conversation);
        const history = await conversation.messages();
        setHistory(history);
      } else {
        console.log("cant message because is not on the network.");
        //cant message because is not on the network.
      }
    }
    if (!conversation && client) loadConversation();
    if (history) {
      console.log("Loaded message history:", history.length);
    }
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
        setSigner(await provider.getSigner());
        setAddress(await provider.getSigner().getAddress());
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
          <button onClick={initXmtpWithKeys} className={styles.btnXmtp}>
            Connect to XMTP
          </button>
        </div>
      )}
      {isConnected && history && address && (
        <Chat
          conversation={conversation}
          messageHistory={history}
          address={address}
        />
      )}
    </div>
  );
}
