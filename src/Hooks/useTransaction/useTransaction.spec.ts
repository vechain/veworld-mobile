import { useTransaction } from "./useTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
import {
    prepareFungibleClause,
    prepareNonFungibleClause,
} from "~Utils/TransactionUtils/TransactionUtils"

const { account1D1, account2D1, VETWithBalance, VTHOWithBalance, NFT_Mock } =
    TestHelpers.data

describe("useTransaction", () => {
    it("VET - should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useTransaction({
                    clauses: prepareFungibleClause(
                        "1",
                        VETWithBalance,
                        account1D1.address,
                    ),
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toBeDefined()
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })
    it("VTHO - should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useTransaction({
                    clauses: prepareFungibleClause(
                        "1",
                        VTHOWithBalance,
                        account1D1.address,
                    ),
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toBeDefined()
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })

    it("NFT - should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useTransaction({
                    clauses: prepareNonFungibleClause(
                        account1D1.address,
                        account2D1.address,
                        NFT_Mock,
                    ),
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toBeDefined()
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })
})
