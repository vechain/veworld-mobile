import { mockTokenRegistry } from "./stubs/TokenRegistryStubs"
import { mockTransactionCall } from "./stubs/TransactionStubs"
import ThorHelpers from "./stubs/Thor"
import * as data from "./data"
export default {
    data,
    mockTokenRegistry,
    thor: ThorHelpers,
    mockTransactionCall,
}
