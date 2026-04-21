"use client";

import { useState, useMemo } from "react";
import { BaseModal } from "./BaseModal";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import type { CryptoCurrency } from "@/lib/meld/types";

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CryptoModal({ isOpen, onClose }: CryptoModalProps) {
  const { cryptoCurrencies, selectedCrypto, setSelectedCrypto } = useWidget();
  const { tokens } = useTheme();
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");

  const chains = useMemo(() => {
    const set = new Set(cryptoCurrencies.map((c) => c.chainName));
    return Array.from(set).sort();
  }, [cryptoCurrencies]);

  const filtered = useMemo(
    () =>
      cryptoCurrencies.filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.currencyCode.toLowerCase().includes(search.toLowerCase());
        const matchesChain =
          chainFilter === "all" || c.chainName === chainFilter;
        return matchesSearch && matchesChain;
      }),
    [cryptoCurrencies, search, chainFilter]
  );

  function handleSelect(crypto: CryptoCurrency) {
    setSelectedCrypto(crypto);
    setSearch("");
    setChainFilter("all");
    onClose();
  }

  function handleClose() {
    setSearch("");
    setChainFilter("all");
    onClose();
  }

  // Chain filter rendered in the sticky header area
  const chainFilterElement = (
    <div className="mb-3">
      <select
        value={chainFilter}
        onChange={(e) => setChainFilter(e.target.value)}
        className="w-full cursor-pointer text-sm outline-none"
        style={{
          padding: "10px 12px",
          border: tokens.inputBorder,
          borderRadius: tokens.inputRadius,
          background: tokens.inputBg,
          color: tokens.textPrimary,
        }}
      >
        <option value="all">All Chains</option>
        {chains.map((chain) => (
          <option key={chain} value={chain}>
            {chain}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select a Cryptocurrency"
      searchPlaceholder="Search for a token"
      searchValue={search}
      onSearchChange={setSearch}
      stickyContent={chainFilterElement}
    >
      <div className="mb-3 text-[13px]" style={{ color: tokens.textMuted }}>
        All Cryptocurrencies
      </div>

      {filtered.map((crypto) => {
        const isSelected =
          selectedCrypto?.currencyCode === crypto.currencyCode &&
          selectedCrypto?.chainCode === crypto.chainCode;

        return (
          <div
            key={`${crypto.currencyCode}-${crypto.chainCode}`}
            onClick={() => handleSelect(crypto)}
            className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors"
            style={{
              background: isSelected ? tokens.selectedBg : "transparent",
              border: isSelected ? tokens.selectedBorder : "1.5px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = tokens.hoverBg;
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="flex items-center gap-3">
              {crypto.symbolImageUrl ? (
                <img
                  src={crypto.symbolImageUrl}
                  alt={crypto.currencyCode}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-bold">
                  {crypto.currencyCode.charAt(0)}
                </div>
              )}
              <div>
                <div
                  className="text-[15px] font-semibold"
                  style={{ color: tokens.textPrimary }}
                >
                  {crypto.currencyCode}
                </div>
                <div className="text-[13px]" style={{ color: tokens.textMuted }}>
                  {crypto.name}
                </div>
              </div>
            </div>

            <div
              className="rounded-md px-2.5 py-1 text-xs"
              style={{
                color: tokens.textSecondary,
                background: tokens.hoverBg,
              }}
            >
              {crypto.chainName}
            </div>
          </div>
        );
      })}
    </BaseModal>
  );
}
