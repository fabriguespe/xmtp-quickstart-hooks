
import { ConnectWallet,useSigner} from "@thirdweb-dev/react";
import React,{ useState,useRef, useEffect} from 'react';
import { useCallback } from "react";
import { buildLocalStorageKey, loadKeys, storeKeys, wipeKeys } from "./keys";
import Chat from "./Chat";
import {Client, useStreamConversations,useClient,useMessages,useConversations,useStartConversation } from "@xmtp/react-sdk";

const PEER_ADDRESS = '0x937C0d4a6294cdfa575de17382c7076b579DC176';
import styles from "./Home.module.css";

export default function HomeSDK() {

  const signer = useSigner();
  //React SDKs
  const { client, initialize } = useClient();
  const { conversations } = useConversations();
  const startConversation = useStartConversation();
  const [conversation, setConversation] = useState(null);
  
  //Message conversation
  const [history, setHistory] = useState(null);
  const { messages } = useMessages( conversation)
  
  //Stream
  const [streamedConversations, setStreamedConversations] = useState([]);

  // callback to handle incoming conversations
  const onConversation = useCallback((conversation) => {
      console.log('stream')
      setStreamedConversations((prev) => [...prev, conversation]);
    },
    [],
  );
  const { error } = useStreamConversations(onConversation)
  if (error) {
    return "An error occurred while streaming conversations";
  }
  //Other
  const isConnected = !!signer;

  //Initialize XMTP
  const initXmtp = (async() => {
    const keys = await client.getKeys(signer);
    // create a client using keys returned from getKeys
    //Use signer wallet from ThirdWeb hook `useSigner`
    await initialize({ signer });
  })

  //Initialize XMTP
  const initXmtpWithKeys = (async() => {
    // create a client using keys returned from getKeys
    //Use signer wallet from ThirdWeb hook `useSigner`
    const address = await signer.getAddress();
    let keys = loadKeys(address);
    if (!keys) {
      keys = await Client.getKeys(signer);
      storeKeys(address, keys);
    }
    await initialize({ keys,signer});

  })


  useEffect(() => {
    console.log(streamedConversations.length)
    async function loadConversation() {
      if(client?.canMessage(PEER_ADDRESS)){
        const convv=await startConversation(PEER_ADDRESS, 'hi')
        setConversation(convv)
        const history = await convv.messages();
        console.log('history',history.length)
        setHistory(history);
      }else{
        console.log("cant message because is not on the network.");
        //cant message because is not on the network.
      }
    }
    if(!conversation && client)loadConversation()
    if(messages){
      console.log('Loaded message history:',messages.length)
    }
  }, [streamedConversations,signer,conversation,client,messages]);
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
      {isConnected && !client && (
        <div className={styles.xmtp}>
          <ConnectWallet theme="light" />
          <button onClick={initXmtpWithKeys} className={styles.btnXmtp}>Connect to XMTP</button>
          {conversations.map((conversation,index) => (
            <div key={index}>
              {conversation?.peerAddress}-{conversation.context?.conversationId}-{JSON.stringify(conversation.context?.metadata)}
            </div>
          ))}
        </div>
      )}
      {/* Render the Chat component if connected, initialized, and messages exist */}
      {isConnected && history && (
        <Chat  conversation={conversation} messageHistory={history} />
      )}
      

    </div>
  );
}
