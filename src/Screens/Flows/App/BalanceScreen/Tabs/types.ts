export const BALANCE_TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

export type BalanceTab = (typeof BALANCE_TABS)[number]
