import { accountStub } from "./AccountStub"
import { blockStub } from "./BlockStub"
import { mockThorInstance } from "./Thor"
import ExplainStub from "./ExplainStub"
import FilterStub from "./FilterStub"
import { tickerStub } from "./TickerStub"
import { transactionStub } from "./TransactionStub"

export default {
    mockThorInstance,
    stubs: {
        account: accountStub,
        block: blockStub,
        explain: ExplainStub,
        filter: FilterStub,
        ticker: tickerStub,
        transaction: transactionStub,
    },
}
