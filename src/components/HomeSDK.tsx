
import { ConnectWallet,useSigner} from "@thirdweb-dev/react";
import React,{ useState,useRef, useEffect} from 'react';
import { useCallback } from "react";
import Chat from "./Chat";
import { useStreamConversations,useClient,useMessages,useConversations,useStartConversation } from "@xmtp/react-sdk";

const PEER_ADDRESS = '0x937C0d4a6294cdfa575de17382c7076b579DC176';
import styles from "./Home.module.css";

export default function HomeSDK() {

  const signer = useSigner();
  const isConnected = !!signer;
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

  const { error } =useStreamConversations(
    useCallback((conversation) => {
      console.log('stream')
      setStreamedConversations((prev) => [...prev, conversation]);
    },[],
  ));

  if (error) {
    return "An error occurred while streaming conversations";
  }

  //Other

  //Initialize XMTP
  const initXmtp = (async() => {
    //Use signer wallet from ThirdWeb hook `useSigner`
    await initialize({ signer });
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
          <button onClick={initXmtp} className={styles.btnXmtp}>Connect to XMTP</button>
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
