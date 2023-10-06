import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Client, useClient } from "@xmtp/react-sdk";
import { ConversationContainer } from "./ConversationContainer";

export default function Home({ wallet, env }) {
  const initialIsOpen =
    localStorage.getItem("isWidgetOpen") === "true" || false;
  const initialIsOnNetwork =
    localStorage.getItem("isOnNetwork") === "true" || false;
  const initialIsConnected =
    (localStorage.getItem("isConnected") && wallet === "true") || false;

  const { client, error, isLoading, initialize } = useClient();
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isOnNetwork, setIsOnNetwork] = useState(initialIsOnNetwork);
  const [isConnected, setIsConnected] = useState(initialIsConnected);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [signer, setSigner] = useState();

  const styles = {
    floatingLogo: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      border: "1px solid #ccc",
      justifyContent: "center",
      boxShadow: "0 2px 10px #ccc",
      cursor: "pointer",
      transition: "transform 0.3s ease",
      padding: "5px",
    },
    Button: {
      position: "fixed",
      bottom: "70px",
      right: "20px",
      width: "300px",
      height: "400px",
      border: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: "1000",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    logoutBtn: {
      position: "absolute",
      top: "10px",
      left: "5px",
      background: "transparent",
      border: "none",
      fontSize: "10px",
      cursor: "pointer",
    },
    widgetHeader: {
      padding: "5px",
    },
    conversationHeader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "none",
      border: "none",
      width: "auto",
      margin: "0px",
    },
    conversationHeaderH4: {
      margin: "0px",
      padding: "4px",
    },
    backButton: {
      border: "0px",
      background: "transparent",
      cursor: "pointer",
    },
    widgetContent: {
      flexGrow: 1,
      overflowY: "auto",
    },
    xmtpContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
    btnXmtp: {
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "#000",
      justifyContent: "center",
      border: "1px solid grey",
      padding: "10px",
      borderRadius: "5px",
    },
    widgetFooter: {
      padding: "5px",
      fontSize: "12px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    powered: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  useEffect(() => {
    localStorage.setItem("isOnNetwork", isOnNetwork.toString());
    localStorage.setItem("isWidgetOpen", isOpen.toString());
    localStorage.setItem("isConnected", isConnected.toString());
  }, [isOpen, isConnected, isOnNetwork]);

  useEffect(() => {
    if (wallet) {
      setSigner(wallet);
      setIsConnected(true);
    }
    if (client && !isOnNetwork) {
      setIsOnNetwork(true);
    }
    if (signer && isOnNetwork) {
      initXmtpWithKeys();
    }
  }, [wallet, signer, client]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
        setIsConnected(true);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      console.error("Metamask not found");
    }
  };

  const getAddress = async (signer) => {
    try {
      return await signer?.getAddress();
    } catch (e) {
      console.log(e);
      console.log("entra3");
    }
  };

  //Initialize XMTP
  const initXmtpWithKeys = async () => {
    const options = {
      env: getEnv(),
    };
    const address = await getAddress(signer);
    let keys = loadKeys(address);
    if (!keys) {
      keys = await Client.getKeys(signer, {
        ...options,
        skipContactPublishing: true,
        persistConversations: false,
      });
      storeKeys(address, keys);
    }
    setLoading(true);
    await initialize({ keys, options, signer });
  };

  const openWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
  };
  window.FloatingInbox = {
    open: openWidget,
    close: closeWidget,
  };
  const handleLogout = async () => {
    setIsConnected(false);
    const address = await getAddress(signer);
    wipeKeys(address);
    setIsOnNetwork(false);
    setSigner(null);
    setSelectedConversation(null);
    localStorage.removeItem("isOnNetwork");
    localStorage.removeItem("isConnected");
  };

  return (
    <>
      <div
        style={styles.floatingLogo}
        onClick={isOpen ? closeWidget : openWidget}
        className={
          "FloatingInbox " +
          (isOpen ? "spin-clockwise" : "spin-counter-clockwise")
        }>
        <SVGLogo parentClass={"FloatingInbox"} />
      </div>
      {isOpen && (
        <div
          style={styles.Button}
          className={"FloatingInbox" + (isOnNetwork ? "expanded" : "")}>
          {isConnected && (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          )}
          {isConnected && isOnNetwork && (
            <div style={styles.widgetHeader}>
              <div style={styles.conversationHeader}>
                {isOnNetwork && selectedConversation && (
                  <button
                    style={styles.backButton}
                    onClick={() => {
                      setSelectedConversation(null);
                    }}>
                    ←
                  </button>
                )}
                <h4 style={styles.conversationHeaderH4}>Conversations</h4>
              </div>
            </div>
          )}
          <div style={styles.widgetContent}>
            {!isConnected && (
              <div style={styles.xmtpContainer}>
                <button style={styles.btnXmtp} onClick={connectWallet}>
                  Connect Wallet
                </button>
              </div>
            )}
            {isConnected && !isOnNetwork && (
              <div style={styles.xmtpContainer}>
                <button style={styles.btnXmtp} onClick={initXmtpWithKeys}>
                  Connect to XMTP
                </button>
              </div>
            )}
            {isConnected && isOnNetwork && client && (
              <ConversationContainer
                client={client}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
              />
            )}
          </div>
          <div style={styles.widgetFooter}>
            <span className="powered" style={styles.powered}>
              Powered by <SVGLogo parentClass="powered" /> XMTP
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function SVGLogo({ parentClass, size, theme }) {
  const color =
    theme === "dark" ? "#fc4f37" : theme === "light" ? "#fc4f37" : "#fc4f37";

  const hoverColor =
    theme === "dark" ? "#fff" : theme === "light" ? "#000" : "#000";

  const uniqueClassLogo = `logo-${Math.random().toString(36).substr(2, 9)}`;

  const logoStyles = {
    container: {
      width: "100%",
    },
    logo: `
        .${uniqueClassLogo} {
          transition: transform 0.5s ease;
        }
        .powered .logo{
          width:12px !important;
          margin-left:2px;
          margin-right:2px;
        }
        .${parentClass}:hover .${uniqueClassLogo} {
          transform: rotate(360deg);
        }
  
        .${parentClass}:hover .${uniqueClassLogo} path {
          fill: ${hoverColor};
        }
      `,
  };

  return (
    <>
      <style>{logoStyles.logo}</style>
      <svg
        className={"logo " + uniqueClassLogo}
        style={logoStyles.container}
        viewBox="0 0 462 462"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fill={color}
          d="M1 231C1 103.422 104.422 0 232 0C359.495 0 458 101.5 461 230C461 271 447 305.5 412 338C382.424 365.464 332 369.5 295.003 349C268.597 333.767 248.246 301.326 231 277.5L199 326.5H130L195 229.997L132 135H203L231.5 184L259.5 135H331L266 230C266 230 297 277.5 314 296C331 314.5 362 315 382 295C403.989 273.011 408.912 255.502 409 230C409.343 131.294 330.941 52 232 52C133.141 52 53 132.141 53 231C53 329.859 133.141 410 232 410C245.674 410 258.781 408.851 271.5 406L283.5 456.5C265.401 460.558 249.778 462 232 462C104.422 462 1 358.578 1 231Z"
        />
      </svg>
    </>
  );
}
const ENCODING = "binary";

export const getEnv = () => {
  // "dev" | "production" | "local"
  return typeof process !== "undefined" && process.env.REACT_APP_XMTP_ENV
    ? process.env.REACT_APP_XMTP_ENV
    : "production";
};
export const buildLocalStorageKey = (walletAddress) => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";
};

export const loadKeys = (walletAddress) => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress, keys) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING),
  );
};

export const wipeKeys = (walletAddress) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
