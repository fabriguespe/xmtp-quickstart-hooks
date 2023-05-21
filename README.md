### Step 0: Install dependencies

```bash
npm install @xmtp/react-sdk
```

### Step 1: Configuring the client

First we need to initialize XMTP client using as signer our wallet connection of choice.


```tsx

import Home from '@/components/Home';
import { XMTPProvider } from "@xmtp/react-sdk";

export default function Index() {
  return (
    <XMTPProvider>
        <HomeSDK/>
    </XMTPProvider>
  );
}
```

### Step 2: Display connect with XMTP

Now that we have the wrapper we can add a button that will sign our user in with XMTP.

```tsx
{!isConnected &&  (
<button onClick={initXmtp} className={styles.btnXmtp}>Connect to XMTP</button>
)}
```
```tsx
const initXmtp = (async() => {
await initialize({ signer });
const convv=await startConversation(PEER_ADDRESS, 'gm')
setConversation(convv)
})
```

### Step 3: Load conversation and messages

Now using our hooks we are going to use the state to listen whan XMTP is connected.

Later we are going to load our conversations and we are going to simulate starting a conversation with one of our bots

```tsx
useEffect(() => {
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
}, [conversation,client,messages]);

