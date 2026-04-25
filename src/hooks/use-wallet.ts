"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// useWallet — MetaMask + Phantom wallet detection, connect, disconnect, sign
// =============================================================================

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      off: (event: string, handler: (...args: unknown[]) => void) => void;
      publicKey: { toString(): string } | null;
    };
  }
}

export type WalletType = "metamask" | "phantom";

export interface WalletConnection {
  address: string;
  type: WalletType;
}

const EVM_CHAINS = new Set(["ETH", "MATIC", "POLYGON", "BSC", "BNB", "AVAX", "ARB", "OP", "BASE"]);

export interface UseWalletReturn {
  hasWallet: boolean;
  connected: WalletConnection | null;
  isConnecting: boolean;
  connectError: string | null;
  connect: (chainCode?: string) => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

export function useWallet(
  onAddressChange: (address: string) => void
): UseWalletReturn {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasPhantom, setHasPhantom] = useState(false);
  const [connected, setConnected] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Stable ref for the callback to avoid re-subscribing on every render
  const onAddressChangeRef = useRef(onAddressChange);
  onAddressChangeRef.current = onAddressChange;

  // Detect available wallets on mount
  useEffect(() => {
    setHasMetaMask(!!window.ethereum?.isMetaMask);
    setHasPhantom(!!window.solana?.isPhantom);
  }, []);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handler = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        setConnected(null);
        onAddressChangeRef.current("");
      } else {
        setConnected({ address: accounts[0], type: "metamask" });
        onAddressChangeRef.current(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handler);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handler);
    };
  }, []);

  const connect = useCallback(async (chainCode?: string) => {
    setIsConnecting(true);
    setConnectError(null);

    const chain = chainCode?.toUpperCase() ?? "";
    const isSolana = chain === "SOL";
    const isEvm = EVM_CHAINS.has(chain);

    try {
      if (isSolana && hasPhantom && window.solana?.isPhantom) {
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        setConnected({ address, type: "phantom" });
        onAddressChangeRef.current(address);
      } else if ((isEvm || !isSolana) && hasMetaMask && window.ethereum) {
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];
        if (accounts.length > 0) {
          setConnected({ address: accounts[0], type: "metamask" });
          onAddressChangeRef.current(accounts[0]);
        }
      } else if (!chain && hasPhantom && window.solana?.isPhantom) {
        // Fallback to Phantom only when no chain specified
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        setConnected({ address, type: "phantom" });
        onAddressChangeRef.current(address);
      } else {
        setConnectError("No compatible wallet detected for this chain");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wallet connection failed";
      setConnectError(message);
    } finally {
      setIsConnecting(false);
    }
  }, [hasMetaMask, hasPhantom]);

  const disconnect = useCallback(() => {
    if (connected?.type === "phantom" && window.solana) {
      window.solana.disconnect().catch(() => {});
    }
    setConnected(null);
    setConnectError(null);
    onAddressChangeRef.current("");
  }, [connected?.type]);

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!connected) return null;

      try {
        if (connected.type === "metamask" && window.ethereum) {
          const signature = (await window.ethereum.request({
            method: "personal_sign",
            params: [message, connected.address],
          })) as string;
          return signature;
        }

        if (connected.type === "phantom" && window.solana) {
          const encoded = new TextEncoder().encode(message);
          const { signature } = await window.solana.signMessage(encoded, "utf8");
          return Array.from(signature)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }
      } catch {
        return null;
      }

      return null;
    },
    [connected]
  );

  return {
    hasWallet: hasMetaMask || hasPhantom,
    connected,
    isConnecting,
    connectError,
    connect,
    disconnect,
    signMessage,
  };
}
