const ENCODING = "binary";

export const getEnv = (): "dev" | "production" | "local" => {
  return "production";
};
export const buildLocalStorageKey = (walletAddress: any) =>
  walletAddress ? `xmtp:${getEnv}:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress: any): Uint8Array | null => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};
export const storeKeys = (walletAddress: any, keys: Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING),
  );
};

export const wipeKeys = (walletAddress: any) => {
  // This will clear the conversation cache + the private keys
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
