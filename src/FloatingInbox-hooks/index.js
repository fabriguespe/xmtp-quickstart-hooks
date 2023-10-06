import Home from "./Home";
import { XMTPProvider } from "@xmtp/react-sdk";

export function FloatingInbox() {
  return (
    <XMTPProvider>
      <Home />
    </XMTPProvider>
  );
}
