export interface LedgerBalance extends Connex.Thor.Account {
    address: string
}

export interface LedgerAccounts {
    balances: LedgerBalance[]
}
