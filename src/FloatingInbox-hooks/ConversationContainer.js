import React, { useState, useEffect } from "react";
import { MessageContainer } from "./MessageContainer";
import { useCanMessage } from "@xmtp/react-sdk";
import { ListConversations } from "./ListConversations";
import { ethers } from "ethers";
import { NewConversation } from "./NewConversation";

export const ConversationContainer = ({
  client,
  selectedConversation,
  setSelectedConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [peerAddress, setPeerAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const { canMessage } = useCanMessage();
  const [conversationFound, setConversationFound] = useState(false);

  const styles = {
    conversations: {
      height: "100%",
    },
    conversationList: {
      overflowY: "auto",
      padding: "0px",
      margin: "0",
      listStyle: "none",
      overflowY: "scroll",
    },
    createNewButton: {
      border: "1px",
      padding: "5px",
      borderRadius: "5px",
      marginTop: "10px",
    },
    peerAddressInput: {
      width: "100%",
      padding: "10px",
      boxSizing: "border-box",
      border: "0px solid #ccc",
    },
  };

  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSearchChange = async (e) => {
    setSearchTerm(e.target.value);
    setMessage("Searching...");
    const addressInput = e.target.value;
    const isEthDomain = /\.eth$/.test(addressInput);
    if (!isEthDomain) {
      return;
    }
    setLoadingResolve(true);
    try {
      const provider = new ethers.providers.CloudflareProvider();
      const resolvedAddress = await provider.resolveName(addressInput);

      if (resolvedAddress && isValidEthereumAddress(resolvedAddress)) {
        processEthereumAddress(resolvedAddress);
        setSearchTerm(resolvedAddress); // <-- Add this line
      } else {
        setMessage("Invalid Ethereum address");
        setPeerAddress(null);
        //setCanMessage(false);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error resolving address");
    } finally {
      setLoadingResolve(false);
    }
  };

  const processEthereumAddress = async (address) => {
    setPeerAddress(address);
    if (address === client.address) {
      setMessage("No self messaging allowed");
      // setCanMessage(false);
    } else {
      const canMessageStatus = await client?.canMessage(address);
      if (canMessageStatus) {
        setPeerAddress(address);
        // setCanMessage(true);
        setMessage("Address is on the network ✅");
      } else {
        //  setCanMessage(false);
        setMessage("Address is not on the network ❌");
      }
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div style={styles.conversations}>
      {!selectedConversation && (
        <ul style={styles.conversationList}>
          <input
            type="text"
            placeholder="Enter a 0x wallet, ENS, or UNS address"
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.peerAddressInput}
          />
          {loadingResolve && searchTerm && <small>Resolving address...</small>}
          <ListConversations
            searchTerm={searchTerm}
            selectConversation={setSelectedConversation}
            client={client}
            onConversationFound={(state) => {
              setConversationFound(state);
            }}
          />
          {peerAddress && canMessage && !conversationFound && (
            <>
              {message && <small>{message}</small>}
              <button
                style={styles.createNewButton}
                onClick={() => {
                  setSelectedConversation({ messages: [] });
                }}>
                Create new conversation
              </button>
            </>
          )}
        </ul>
      )}
      {selectedConversation && (
        <>
          {selectedConversation.id ? (
            <MessageContainer
              client={client}
              conversation={selectedConversation}
            />
          ) : (
            <NewConversation
              selectConversation={setSelectedConversation}
              peerAddress={peerAddress}
            />
          )}
        </>
      )}
    </div>
  );
};
