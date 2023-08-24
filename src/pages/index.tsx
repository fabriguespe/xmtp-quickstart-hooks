import Home from "@/components/Home";
import { XMTPProvider } from "@xmtp/react-sdk";

export default function Index() {
  return (
    <XMTPProvider>
      <Home />
    </XMTPProvider>
  );
}
