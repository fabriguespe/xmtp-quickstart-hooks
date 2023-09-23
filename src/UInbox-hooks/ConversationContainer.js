import React, { useState, useEffect } from "react";
import { MessageContainer } from "./MessageContainer"; // Import MessageContainer
import axios from "axios";
import { useCanMessage } from "@xmtp/react-sdk";
import styled from "styled-components";
import { ListConversations } from "./ListConversations";

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

  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSearchChange = async (e) => {
    setSearchTerm(e.target.value);
    const addressInput = e.target.value;

    // Check if it's already a valid Ethereum address first
    if (isValidEthereumAddress(addressInput)) {
      processEthereumAddress(addressInput);
      return;
    }
    setLoadingResolve(true); // Set loading to true here

    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.everyname.xyz/forward?domain=${addressInput}`,
        headers: {
          Accept: "application/json",
          "api-key": process.env.REACT_APP_EVERYNAME_KEY,
        },
      };

      const response = await axios.request(config);
      const resolvedAddress = response.data.address; // Assuming the API returns the address with key "address"

      if (resolvedAddress && isValidEthereumAddress(resolvedAddress)) {
        processEthereumAddress(resolvedAddress);
        setSearchTerm(resolvedAddress); // <-- Add this line
      } else {
        setMessage("Invalid Ethereum address");
        setPeerAddress(null);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error resolving address");
    } finally {
      setLoadingResolve(false); // Set loading to false whether it's successful or there's an error
    }
  };

  const processEthereumAddress = async (address) => {
    setPeerAddress(address);
    if (address === client.address) {
      setMessage("No self messaging allowed");
    } else {
      const canMessageStatus = await canMessage(address);
      if (canMessageStatus) {
        setPeerAddress(address);
        setMessage("Address is on the network ✅");
      } else {
        setMessage("Address is not on the network ❌");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Conversations>
      {!selectedConversation && (
        <ConversationList>
          <PeerAddressInput
            type="text"
            placeholder="Enter a 0x wallet, ENS, or UNS address"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {loadingResolve && searchTerm && <small>Resolving address...</small>}
          <ListConversations selectConversation={setSelectedConversation} />
        </ConversationList>
      )}
      {selectedConversation && (
        <MessageContainer
          client={client}
          conversation={selectedConversation}
          searchTerm={searchTerm}
          selectConversation={setSelectedConversation}
        />
      )}
    </Conversations>
  );
};

const Conversations = styled.div`
  height: 100% !important;
`;

const ConversationList = styled.ul`
  overflow-y: auto;
  padding: 0px;
  margin: 0;
  list-style: none;
  overflow-y: scroll;
`;

const CreateNewButton = styled.button`
  border: 1px;
  padding: 5px;
  border-radius: 5px;
  margin-top: 10px;
`;

const PeerAddressInput = styled.input`
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 0px solid #ccc;
`;
