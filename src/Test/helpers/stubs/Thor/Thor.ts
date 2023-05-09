import { genesises } from "~Common/Constant/Thor/ThorConstants"
import { accountStub } from "./AccountStub"
import { blockStub } from "./BlockStub"
import { explainStub } from "./ExplainStub/ExplainStub"
import { filterStub } from "./FilterStub/FilterStub"
import { tickerStub } from "./TickerStub"
import { transactionStub } from "./TransactionStub"

const mockedChainStatus: Connex.Thor.Status = {
    progress: 1,
    head: {
        id: "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
        number: 13510562,
        timestamp: 1665136970,
        parentID:
            "0x00ce27a1e9047dbd8c8679830a12ee23f56908879be1b32943e4a3f83072b6da",
        txsFeatures: 1,
        gasLimit: 30000000,
    },
    finalized:
        "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
}
interface MockThorInstanceOptions {
    genesis?: Connex.Thor.Block
    status?: Connex.Thor.Status
    account?: (addr: string) => Connex.Thor.Account.Visitor
    block?: (revision?: string | number) => Connex.Thor.Block.Visitor
    explain?: (clauses: Connex.VM.Clause[]) => Connex.VM.Explainer
    filter?: (
        kind: "event" | "transfer",
        criteria: Connex.Thor.Filter.Criteria<"event" | "transfer">[],
    ) => Connex.Thor.Filter<"event" | "transfer">
    ticker?: () => Connex.Thor.Ticker
    transaction?: (id: string) => Connex.Thor.Transaction.Visitor
}

/**
 * Returns a mock of the Connex.Thor interface with the given options
 * You can override any of the methods of the interface by passing the corresponding option
 *
 * @returns {Connex.Thor} mock of the Connex.Thor interface
 */
export const mockThorInstance = ({
    genesis = genesises.test,
    status = mockedChainStatus,
    account = accountStub({}),
    block = blockStub,
    explain = explainStub,
    filter = filterStub,
    ticker = tickerStub,
    transaction = transactionStub,
}: MockThorInstanceOptions): Connex.Thor => {
    return {
        genesis,
        status,
        account,
        block,
        explain,
        filter,
        ticker,
        transaction,
    }
}
