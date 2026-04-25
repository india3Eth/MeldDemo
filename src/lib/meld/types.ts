// =============================================================================
// Meld White-Label API — TypeScript Type Definitions
// =============================================================================
// All types mirror the Meld API response schemas.
// Docs: https://docs.meld.io/docs/whitelabel-api-guide
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type SessionType = "BUY" | "SELL" | "TRANSFER";

export type TransactionType =
  | "CRYPTO_PURCHASE"
  | "CRYPTO_SELL"
  | "CRYPTO_TRANSFER";

export type TransactionStatus =
  | "PENDING_CREATED"
  | "PENDING"
  | "TWO_FA_REQUIRED"
  | "TWO_FA_PROVIDED"
  | "SETTLING"
  | "SETTLED"
  | "FAILED"
  | "DECLINED"
  | "CANCELLED"
  | "REFUNDED"
  | "ERROR";

export type ServiceProviderStatus = "LIVE" | "RECENTLY_ADDED" | "BUILDING";

export type ServiceProviderCategory =
  | "BANK_LINKING"
  | "CRYPTO_OFFRAMP"
  | "CRYPTO_ONRAMP"
  | "CRYPTO_TRANSFER"
  | "CRYPTO_VIRTUAL_ACCOUNT_OFFRAMP"
  | "CRYPTO_VIRTUAL_ACCOUNT_ONRAMP"
  | "FIAT_PAYMENTS";

export type PaymentType =
  | "ACH"
  | "BANK_TRANSFER"
  | "CARD"
  | "LOCAL"
  | "MOBILE_WALLET"
  | "SEPA";

export type WebhookEventType =
  | "TRANSACTION_CRYPTO_PENDING"
  | "TRANSACTION_CRYPTO_TRANSFERRING"
  | "TRANSACTION_CRYPTO_COMPLETE"
  | "TRANSACTION_CRYPTO_FAILED"
  | "CUSTOMER_KYC_STATUS_CHANGE";

// ---------------------------------------------------------------------------
// Country & Region
// ---------------------------------------------------------------------------

export interface Region {
  regionCode: string;
  name: string;
}

export interface Country {
  countryCode: string;
  name: string;
  flagImageUrl: string;
  regions?: Region[];
  serviceProviderDetails?: Record<string, { countryCode: string }>;
}

// ---------------------------------------------------------------------------
// Defaults by Country
// ---------------------------------------------------------------------------

export interface DefaultsPerCountry {
  countryCode: string;
  defaultCurrencyCode: string;
  defaultPaymentMethods: string[];
}

// ---------------------------------------------------------------------------
// Fiat Currency
// ---------------------------------------------------------------------------

export interface FiatCurrency {
  currencyCode: string;
  name: string;
  symbolImageUrl: string;
  serviceProviderDetails?: Record<string, { currencyCode: string }>;
}

// ---------------------------------------------------------------------------
// Crypto Currency
// ---------------------------------------------------------------------------

export interface CryptoCurrency {
  currencyCode: string;
  name: string;
  chainCode: string;
  chainId: string;
  chainName: string;
  contractAddress: string;
  symbolImageUrl: string;
  serviceProviderDetails?: Record<
    string,
    { chainCode: string; currencyCode: string }
  >;
}

// ---------------------------------------------------------------------------
// Payment Method
// ---------------------------------------------------------------------------

export interface PaymentMethod {
  paymentMethod: string;
  name: string;
  paymentType: PaymentType;
  logos: {
    dark: string;
    light: string;
  };
  serviceProviderDetails?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Service Provider
// ---------------------------------------------------------------------------

export interface ServiceProvider {
  serviceProvider: string;
  name: string;
  status: ServiceProviderStatus;
  categories: ServiceProviderCategory[];
  categoryStatuses: Record<string, ServiceProviderStatus>;
  logos: {
    light: string;
    dark: string;
    lightShort: string;
    darkShort: string;
  };
  websiteUrl: string;
  customerSupportUrl: string;
}

// ---------------------------------------------------------------------------
// Purchase & Sell Limits
// ---------------------------------------------------------------------------

interface LimitDetail {
  defaultAmount: number;
  maximumAmount: number;
  minimumAmount: number;
}

export interface FiatCurrencyPurchaseLimit {
  currencyCode: string;
  defaultAmount: number;
  maximumAmount: number;
  minimumAmount: number;
  meldDetails?: LimitDetail;
  serviceProviderDetails?: Record<string, LimitDetail>;
  accountDetails?: Record<string, LimitDetail>;
}

export interface CryptoCurrencySellLimit {
  chainCode: string;
  currencyCode: string;
  defaultAmount: number;
  maximumAmount: number;
  minimumAmount: number;
  meldDetails?: LimitDetail;
  serviceProviderDetails?: Record<string, LimitDetail>;
  accountDetails?: Record<string, LimitDetail>;
}

// ---------------------------------------------------------------------------
// KYC Fiat Levels
// ---------------------------------------------------------------------------

interface KycLevelLimits {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  transaction: number;
}

export interface KycFiatLevel {
  currencyCode: string;
  level1: KycLevelLimits;
  level2: KycLevelLimits;
  level3: KycLevelLimits;
  serviceProviderDetails?: Record<
    string,
    { level1: KycLevelLimits; level2: KycLevelLimits; level3: KycLevelLimits }
  >;
}

// ---------------------------------------------------------------------------
// Crypto Quote
// ---------------------------------------------------------------------------

export interface QuoteRequest {
  countryCode: string;
  sourceCurrencyCode: string;
  sourceAmount: number;
  destinationCurrencyCode: string;
  paymentMethodType?: string;
  serviceProviders?: string[];
  walletAddress?: string;
  externalCustomerId?: string;
  customerId?: string;
  subdivision?: string;
}

export interface RampIntelligence {
  rampScore: number;
  lowKyc: boolean | null;
}

export interface Quote {
  countryCode: string;
  destinationAmount: number;
  destinationCurrencyCode: string;
  exchangeRate: number;
  fiatAmountWithoutFees: number;
  institutionName: string;
  isNativeAvailable: boolean;
  lowKyc: boolean | null;
  networkFee: number;
  partnerFee: number | null;
  paymentMethodType: string;
  serviceProvider: string;
  sourceAmount: number;
  sourceCurrencyCode: string;
  totalFee: number;
  transactionFee: number;
  transactionType: TransactionType;
  customerScore: number;
  rampIntelligence?: RampIntelligence;
}

export interface QuoteResponse {
  quotes: Quote[];
}

// ---------------------------------------------------------------------------
// Widget Session
// ---------------------------------------------------------------------------

export interface SessionData {
  countryCode: string;
  sourceCurrencyCode: string;
  sourceAmount: string;
  destinationCurrencyCode: string;
  serviceProvider: string;
  walletAddress?: string;
  paymentMethodType?: string;
  lockFields?: string[];
  redirectUrl?: string;
  redirectFlow?: boolean;
  clientIpAddress?: string;
}

export interface WidgetSessionRequest {
  sessionType: SessionType;
  sessionData: SessionData;
  externalCustomerId?: string;
  externalSessionId?: string;
  customerId?: string;
  bypassKyc?: boolean;
}

export interface WidgetSessionResponse {
  id: string;
  token: string;
  customerId: string;
  externalCustomerId: string;
  externalSessionId: string;
  widgetUrl: string;
  serviceProviderWidgetUrl: string;
}

// ---------------------------------------------------------------------------
// Transaction
// ---------------------------------------------------------------------------

export interface TransactionCustomer {
  id: string;
  externalId: string;
  email: string;
  phone: string;
  name: { firstName: string; lastName: string };
}

export interface CryptoDetails {
  sourceWalletAddress: string | null;
  destinationWalletAddress: string | null;
  sessionWalletAddress: string | null;
  networkFee: number | null;
  transactionFee: number | null;
  partnerFee: number | null;
  totalFee: number | null;
  networkFeeInUsd: number | null;
  transactionFeeInUsd: number | null;
  partnerFeeInUsd: number | null;
  totalFeeInUsd: number | null;
  blockchainTransactionId: string | null;
  chainId: string | null;
}

export interface Transaction {
  id: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  status: TransactionStatus;
  transactionType: TransactionType;
  serviceProvider: string;
  sourceAmount: number;
  sourceCurrencyCode: string;
  destinationAmount: number;
  destinationCurrencyCode: string;
  paymentMethodType: string | null;
  countryCode: string;
  customer: TransactionCustomer;
  externalCustomerId: string;
  externalSessionId: string;
  externalReferenceId: string;
  sessionId: string;
  key: string;
  isImported: boolean;
  isPassthrough: boolean;
  serviceTransactionId: string;
  cryptoDetails: CryptoDetails | null;
  description: string | null;
}

export interface TransactionSearchResponse {
  count: number;
  remaining: number;
  totalCount: number;
  transactions: Transaction[];
}

export interface TransactionSearchParams {
  statuses?: string;
  serviceProviders?: string;
  limit?: number;
  amountFrom?: number;
  amountTo?: number;
  from?: string;
  to?: string;
  before?: string;
  after?: string;
  externalCustomerIds?: string;
  externalSessionIds?: string;
  customerIds?: string;
  sessionIds?: string;
  types?: string;
}

// ---------------------------------------------------------------------------
// Webhook Event
// ---------------------------------------------------------------------------

export interface WebhookPayload {
  accountId: string;
  customerId: string;
  externalCustomerId: string;
  externalSessionId: string;
  paymentTransactionId: string;
  paymentTransactionStatus: TransactionStatus;
  sessionId: string;
}

export interface WebhookEvent {
  eventType: WebhookEventType;
  eventId: string;
  timestamp: string;
  accountId: string;
  profileId: string;
  version: string;
  transactionType: TransactionType;
  payload: WebhookPayload;
}

// ---------------------------------------------------------------------------
// Common query params shared across service-provider property endpoints
// ---------------------------------------------------------------------------

export interface ServiceProviderPropertyParams {
  serviceProviders?: string;
  statuses?: string;
  categories?: string;
  accountFilter?: boolean;
  countries?: string;
  fiatCurrencies?: string;
  cryptoChains?: string;
  cryptoCurrencies?: string;
  paymentMethodTypes?: string;
  includeServiceProviderDetails?: boolean;
}
