### Step 0: Install dependencies

```bash
npm install @xmtp/react-sdk
```

### Step 1: Configuring the client

First we need to initialize XMTP client using as signer our wallet connection of choice.

```tsx
// Function to connect to the wallet
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
```

### Step 2: Display connect with XMTP

Now that we have the wrapper we can add a button that will sign our user in with XMTP.

```tsx
{
  !isConnected && (
    <button onClick={initXmtp} className={styles.btnXmtp}>
      Connect to XMTP
    </button>
  );
}
```

```tsx
const clientOptions = {
  env: "production",
};

const initXmtp = async () => {
  await initialize({ signer, options: { clientOptions } });
};
```

### Step 3: Load conversation and messages

Now using our hooks we are going to use the state to listen whan XMTP is connected.

Later we are going to load our conversations and we are going to simulate starting a conversation with one of our bots

```tsx
const { canMessage } = useCanMessage();

useEffect(() => {
  async function loadConversation() {
    if (await canMessage(PEER_ADDRESS)) {
      const convv = await startConversation(PEER_ADDRESS, "hi");
      setConversation(convv);
      const history = await convv.messages();
      console.log("history", history.length);
      setHistory(history);
    } else {
      console.log("cant message because is not on the network.");
      //cant message because is not on the network.
    }
  }
  if (!conversation && client) loadConversation();
}, [conversation, client, messages]);
```

### Step 4: Listen to conversations

In your component initialize the hook to listen to conversations

```tsx
const [history, setHistory] = useState(null);
const { messages } = useMessages(conversation);
// Stream messages
const onMessage = useCallback((message) => {
  setHistory((prevMessages) => {
    const msgsnew = [...prevMessages, message];
    return msgsnew;
  });
}, []);
useStreamMessages(conversation, onMessage);
```

### Step 5 (optional): Save keys

We are going to use a help file to storage our keys and save from re-signing to xmtp each time

```tsx
const ENCODING = "binary";

export const buildLocalStorageKey = (walletAddress: string) =>
  walletAddress ? `xmtp:${"dev"}:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress: string): Uint8Array | null => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING),
  );
};

export const wipeKeys = (walletAddress: string) => {
  // This will clear the conversation cache + the private keys
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
```

Then in our main app we can use them for initiating the client

```tsx
//Initialize XMTP
const initXmtpWithKeys = async () => {
  // create a client using keys returned from getKeys
  const address = await signer.getAddress();
  let keys = loadKeys(address);
  if (!keys) {
    keys = await Client.getKeys(signer, {
      ...clientOptions,
      // we don't need to publish the contact here since it
      // will happen when we create the client later
      skipContactPublishing: true,
      // we can skip persistence on the keystore for this short-lived
      // instance
      persistConversations: false,
    });
    storeKeys(address, keys);
  }
  await initialize({ keys, options, signer });
};
```
