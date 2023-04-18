import {
    mockFiatExchanges,
    mockGetCurrencies,
    mockGetVetExchangeRate,
    mockGetVthoExchangeRate,
} from "./stubs/FiatExchangeStubs"
import { mockThorTransactions } from "./stubs/ThorStub"
import { mockTokenRegistry } from "./stubs/TokenRegistryStubs"
import { mockGetBlock } from "./stubs/BlockStubs"
import { mockTransactionCall } from "./stubs/TransactionStubs"
import { mockGetBalance } from "./stubs/BalanceStubs"

export default {
    mockTokenRegistry,
    mockThorTransactions,
    mockFiatExchanges,
    mockGetCurrencies,
    mockGetVetExchangeRate,
    mockGetVthoExchangeRate,
    mockGetBlock,
    mockTransactionCall,
    mockGetBalance,
}
