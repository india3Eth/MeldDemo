"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// useWallet — multi-wallet detection via EIP-6963 (EVM) + window injection
//
// EIP-6963: wallets announce themselves via DOM events instead of fighting over
// window.ethereum. Each announcement includes the wallet's real name and icon.
// This works with any number of EVM extensions installed simultaneously.
//
// Non-EVM wallets (Phantom Solana, Starkey) still use window injection since
// they don't operate on EIP-6963 for their native chains.
// =============================================================================

// ── EIP-6963 types ────────────────────────────────────────────────────────────

interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface EIP6963ProviderInfo {
  rdns: string;   // e.g. "io.metamask", "app.phantom"
  uuid: string;
  name: string;   // "MetaMask", "Phantom", etc.
  icon: string;   // data URI — the wallet's real icon
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

// ── Non-EVM window types ──────────────────────────────────────────────────────

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      off: (event: string, handler: (...args: unknown[]) => void) => void;
      publicKey: { toString(): string } | null;
    };
    starkey?: {
      aptos?: {
        connect: () => Promise<{ address: string }[]>;
        disconnect: () => Promise<void>;
      };
      sui?: {
        requestAccounts: () => Promise<string[]>;
        disconnect: () => Promise<void>;
      };
    };
  }
}

// ── Public types ──────────────────────────────────────────────────────────────

export type WalletType = string; // rdns for EVM (e.g. "io.metamask"), or "phantom-sol" / "starkey"

export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;       // data URI from EIP-6963, or emoji fallback
  chain: "evm" | "solana" | "other";
}

export interface WalletConnection {
  address: string;
  type: WalletType;
  name: string;
}

const EVM_CHAINS = new Set(["ETH", "MATIC", "POLYGON", "BSC", "BNB", "AVAX", "ARB", "OP", "BASE"]);

export interface UseWalletReturn {
  hasWallet: boolean;
  availableWallets: WalletInfo[];
  connected: WalletConnection | null;
  isConnecting: boolean;
  connectError: string | null;
  connect: (chainCode?: string) => Promise<void>;
  connectSpecific: (walletType: WalletType, chainCode?: string) => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

export function useWallet(
  onAddressChange: (address: string) => void
): UseWalletReturn {
  // EVM wallets discovered via EIP-6963
  const [evmWallets, setEvmWallets] = useState<Map<string, EIP6963ProviderDetail>>(new Map());
  // Non-EVM wallets detected from window
  const [hasPhantomSol, setHasPhantomSol] = useState(false);
  const [hasStarkey,    setHasStarkey]    = useState(false);

  const [connected,    setConnected]    = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const onAddressChangeRef = useRef(onAddressChange);
  onAddressChangeRef.current = onAddressChange;

  // ── EIP-6963 discovery ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (event: Event) => {
      const { info, provider } = (event as CustomEvent<EIP6963ProviderDetail>).detail;
      setEvmWallets((prev) => {
        const next = new Map(prev);
        next.set(info.rdns, { info, provider });
        return next;
      });
    };

    window.addEventListener("eip6963:announceProvider", handler);
    // Trigger all installed EVM extensions to announce themselves
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => window.removeEventListener("eip6963:announceProvider", handler);
  }, []);

  // ── Non-EVM wallet detection ────────────────────────────────────────────────
  useEffect(() => {
    setHasPhantomSol(!!window.solana?.isPhantom);
    setHasStarkey(!!(window.starkey?.aptos || window.starkey?.sui));
  }, []);

  // ── MetaMask accountsChanged listener ──────────────────────────────────────
  useEffect(() => {
    const mm = evmWallets.get("io.metamask")?.provider;
    if (!mm) return;
    const handler = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setConnected(null);
        onAddressChangeRef.current("");
      } else {
        setConnected({ address: accounts[0], type: "io.metamask", name: "MetaMask" });
        onAddressChangeRef.current(accounts[0]);
      }
    };
    mm.on("accountsChanged", handler);
    return () => mm.removeListener("accountsChanged", handler);
  }, [evmWallets]);

  // ── Available wallets list ──────────────────────────────────────────────────
  // If Phantom is present both as EIP-6963 EVM wallet AND window.solana,
  // label the Solana entry "Phantom (Solana)" to avoid two identical "Phantom" rows.
  const phantomAlsoEvm = Array.from(evmWallets.values()).some(
    ({ info }) => info.name.toLowerCase().includes("phantom")
  );

  const availableWallets: WalletInfo[] = [
    ...Array.from(evmWallets.values()).map(({ info }) => ({
      type: info.rdns,
      name: info.name,
      icon: info.icon,
      chain: "evm" as const,
    })),
    hasPhantomSol && {
      type: "phantom-sol",
      name: phantomAlsoEvm ? "Phantom (Solana)" : "Phantom",
      icon: "👻",
      chain: "solana" as const,
    },
    hasStarkey && {
      type: "starkey",
      name: "Starkey",
      icon: "⭐",
      chain: "other" as const,
    },
  ].filter(Boolean) as WalletInfo[];

  // ── Connect a specific wallet ───────────────────────────────────────────────
  const connectSpecific = useCallback(async (walletType: WalletType, _chainCode?: string) => {
    setIsConnecting(true);
    setConnectError(null);

    try {
      // EVM wallet via EIP-6963
      const evmDetail = evmWallets.get(walletType);
      if (evmDetail) {
        const accounts = (await evmDetail.provider.request({
          method: "eth_requestAccounts",
        })) as string[];
        if (accounts.length > 0) {
          setConnected({ address: accounts[0], type: walletType, name: evmDetail.info.name });
          onAddressChangeRef.current(accounts[0]);
        }
        return;
      }

      // Phantom Solana
      if (walletType === "phantom-sol") {
        if (!window.solana?.isPhantom) throw new Error("Phantom not found");
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        setConnected({ address, type: "phantom-sol", name: "Phantom" });
        onAddressChangeRef.current(address);
        return;
      }

      // Starkey
      if (walletType === "starkey") {
        if (window.starkey?.aptos) {
          const accounts = await window.starkey.aptos.connect();
          const address = accounts[0]?.address;
          if (!address) throw new Error("Starkey returned no accounts");
          setConnected({ address, type: "starkey", name: "Starkey" });
          onAddressChangeRef.current(address);
        } else if (window.starkey?.sui) {
          const accounts = await window.starkey.sui.requestAccounts();
          const address = accounts[0];
          if (!address) throw new Error("Starkey returned no accounts");
          setConnected({ address, type: "starkey", name: "Starkey" });
          onAddressChangeRef.current(address);
        } else {
          throw new Error("Starkey not found");
        }
        return;
      }

      throw new Error("Wallet not found");
    } catch (err: unknown) {
      setConnectError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, [evmWallets]);

  // ── Auto-select best wallet for chain ──────────────────────────────────────
  const connect = useCallback(async (chainCode?: string) => {
    const chain = chainCode?.toUpperCase() ?? "";
    const isSolana = chain === "SOL";
    const isEvm = EVM_CHAINS.has(chain);

    if (isSolana && hasPhantomSol) {
      return connectSpecific("phantom-sol", chainCode);
    }
    if ((isEvm || (!isSolana && chain !== "")) && evmWallets.size > 0) {
      // Prefer MetaMask if available, else first EVM wallet
      const preferred = evmWallets.get("io.metamask") ?? evmWallets.values().next().value;
      return connectSpecific(preferred!.info.rdns, chainCode);
    }
    // No chain / unknown — prefer first EVM → Phantom → Starkey
    if (evmWallets.size > 0) return connectSpecific(evmWallets.values().next().value!.info.rdns, chainCode);
    if (hasPhantomSol) return connectSpecific("phantom-sol", chainCode);
    if (hasStarkey)    return connectSpecific("starkey", chainCode);

    setConnectError("No compatible wallet detected");
  }, [evmWallets, hasPhantomSol, hasStarkey, connectSpecific]);

  const disconnect = useCallback(() => {
    if (connected?.type === "phantom-sol" && window.solana) {
      window.solana.disconnect().catch(() => {});
    }
    if (connected?.type === "starkey") {
      window.starkey?.aptos?.disconnect().catch(() => {});
      window.starkey?.sui?.disconnect().catch(() => {});
    }
    setConnected(null);
    setConnectError(null);
    onAddressChangeRef.current("");
  }, [connected?.type]);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!connected) return null;
    try {
      const evmDetail = evmWallets.get(connected.type);
      if (evmDetail) {
        return (await evmDetail.provider.request({
          method: "personal_sign",
          params: [message, connected.address],
        })) as string;
      }
      if (connected.type === "phantom-sol" && window.solana) {
        const encoded = new TextEncoder().encode(message);
        const { signature } = await window.solana.signMessage(encoded, "utf8");
        return Array.from(signature).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch { /* ignore */ }
    return null;
  }, [connected, evmWallets]);

  return {
    hasWallet: availableWallets.length > 0,
    availableWallets,
    connected,
    isConnecting,
    connectError,
    connect,
    connectSpecific,
    disconnect,
    signMessage,
  };
}
