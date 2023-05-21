
import Home from '@/components/Home';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { XMTPProvider } from "@xmtp/react-sdk";
import { StrictMode } from "react";


export default function Index() {
  return (
    <ThirdwebProvider activeChain={'goerli'}>
        <XMTPProvider>
          <Home/>
        </XMTPProvider>
    </ThirdwebProvider>
  );
}

