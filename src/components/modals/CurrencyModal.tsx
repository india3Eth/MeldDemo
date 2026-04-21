"use client";

import { useState, useMemo } from "react";
import { BaseModal } from "./BaseModal";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import type { FiatCurrency } from "@/lib/meld/types";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CurrencyModal({ isOpen, onClose }: CurrencyModalProps) {
  const { fiatCurrencies, selectedFiatCurrency, setSelectedFiatCurrency } = useWidget();
  const { tokens } = useTheme();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      fiatCurrencies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.currencyCode.toLowerCase().includes(search.toLowerCase())
      ),
    [fiatCurrencies, search]
  );

  function handleSelect(currency: FiatCurrency) {
    setSelectedFiatCurrency(currency);
    setSearch("");
    onClose();
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => { setSearch(""); onClose(); }}
      title="Select Your Currency"
      searchPlaceholder="Search for a currency"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mb-3 text-[13px]" style={{ color: tokens.textMuted }}>
        All Currencies
      </div>
      {filtered.map((currency) => (
        <div
          key={currency.currencyCode}
          onClick={() => handleSelect(currency)}
          className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
          style={{
            background:
              selectedFiatCurrency?.currencyCode === currency.currencyCode
                ? tokens.selectedBg
                : "transparent",
          }}
          onMouseEnter={(e) => {
            if (selectedFiatCurrency?.currencyCode !== currency.currencyCode)
              e.currentTarget.style.background = tokens.hoverBg;
          }}
          onMouseLeave={(e) => {
            if (selectedFiatCurrency?.currencyCode !== currency.currencyCode)
              e.currentTarget.style.background = "transparent";
          }}
        >
          {currency.symbolImageUrl ? (
            <img
              src={currency.symbolImageUrl}
              alt={currency.currencyCode}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span className="text-[28px]">💰</span>
          )}
          <div>
            <div
              className="text-[15px] font-semibold"
              style={{ color: tokens.textPrimary }}
            >
              {currency.currencyCode}
            </div>
            <div className="text-[13px]" style={{ color: tokens.textMuted }}>
              {currency.name}
            </div>
          </div>
        </div>
      ))}
    </BaseModal>
  );
}
