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
import {
    NewThorStub as mockNewThor,
    mockNewThorGetAccountRejects,
} from "./stubs/NewThorStub"
import * as data from "./data"
export default {
    data,
    mockTokenRegistry,
    mockThorTransactions,
    mockFiatExchanges,
    mockGetCurrencies,
    mockGetVetExchangeRate,
    mockGetVthoExchangeRate,
    mockGetBlock,
    mockNewThor,
    mockNewThorGetAccountRejects,
    mockTransactionCall,
    mockGetBalance,
}
