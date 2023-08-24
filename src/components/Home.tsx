import React, { useState, useEffect, useCallback } from "react";
import Chat from "./Chat";
import styles from "./Home.module.css";
import { ethers } from "ethers";
import { loadKeys, storeKeys, getEnv } from "./helpers";

import {
  Client,
  useClient,
  useCanMessage,
  useStartConversation,
} from "@xmtp/react-sdk";

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { client, initialize } = useClient();
  const { canMessage } = useCanMessage();
  const { startConversation } = useStartConversation();
  //Conversation
  const [conversation, setConversation] = useState(null);
  //Initialize XMTP
  const initXmtpWithKeys = async () => {
    const options = {
      env: getEnv(),
    };
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
      let peer_address;
      if (address == "0x7E0b0363404751346930AF92C80D1fef932Cc48a")
        peer_address = "0x0AD3A479B31072bc14bDE6AaD601e4cbF13e78a8";
      else peer_address = "0x7E0b0363404751346930AF92C80D1fef932Cc48a";
      console.log("new ", address, peer_address);
      console.log(address, peer_address);
      if (await canMessage(peer_address)) {
        const { conversation, cachedConversation } = await startConversation(
          peer_address,
          "hi",
        );
        console.log(conversation);
        setConversation(conversation);
        const arra = await conversation?.messages();
        console.log(arra?.length);
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
      {isConnected && address && conversation && (
        <Chat conversation={conversation} address={address} />
      )}
    </div>
  );
}
