"use client";

import { useState, useMemo } from "react";
import { BaseModal } from "./BaseModal";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import type { Country } from "@/lib/meld/types";

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CountryModal({ isOpen, onClose }: CountryModalProps) {
  const { countries, selectedCountry, setSelectedCountry } = useWidget();
  const { tokens } = useTheme();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.countryCode.toLowerCase().includes(search.toLowerCase())
      ),
    [countries, search]
  );

  function handleSelect(country: Country) {
    setSelectedCountry(country);
    setSearch("");
    onClose();
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => { setSearch(""); onClose(); }}
      title="Select Country of Residence"
      searchPlaceholder="Search for a country"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mb-3 text-[13px]" style={{ color: tokens.textMuted }}>
        All Countries
      </div>
      {filtered.map((country) => (
        <div
          key={country.countryCode}
          onClick={() => handleSelect(country)}
          className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
          style={{
            background:
              selectedCountry?.countryCode === country.countryCode
                ? tokens.selectedBg
                : "transparent",
            border:
              selectedCountry?.countryCode === country.countryCode
                ? tokens.selectedBorder
                : "1.5px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (selectedCountry?.countryCode !== country.countryCode)
              e.currentTarget.style.background = tokens.hoverBg;
          }}
          onMouseLeave={(e) => {
            if (selectedCountry?.countryCode !== country.countryCode)
              e.currentTarget.style.background = "transparent";
          }}
        >
          {country.flagImageUrl ? (
            <img
              src={country.flagImageUrl}
              alt={country.name}
              className="h-7 w-9 rounded-sm object-cover"
            />
          ) : (
            <span className="text-[28px]">🌍</span>
          )}
          <div>
            <div
              className="text-[15px] font-semibold"
              style={{ color: tokens.textPrimary }}
            >
              {country.name}
            </div>
            <div className="text-[13px]" style={{ color: tokens.textMuted }}>
              {country.countryCode}
            </div>
          </div>
        </div>
      ))}
    </BaseModal>
  );
}
