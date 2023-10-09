import Home from "./Home";
import { XMTPProvider } from "@xmtp/react-sdk";

export function FloatingInbox({ isPWA = false }) {
  return (
    <XMTPProvider>
      <Home isPWA={isPWA} />
    </XMTPProvider>
  );
}
