import Home from "./Home";
import { XMTPProvider } from "@xmtp/react-sdk";

export function UInbox() {
  return (
    <XMTPProvider>
      <Home />
    </XMTPProvider>
  );
}
