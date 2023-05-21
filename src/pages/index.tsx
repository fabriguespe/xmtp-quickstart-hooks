
import HomeSDK from '@/components/HomeSDK';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { XMTPProvider } from "@xmtp/react-sdk";
import { StrictMode } from "react";


export default function Index() {
  return (
    <ThirdwebProvider activeChain={'goerli'}>
        <XMTPProvider>
          <HomeSDK/>
        </XMTPProvider>
    </ThirdwebProvider>
  );
}

