import { RootState } from "../Types"
import { selectDelegationState, selectDelegationUrls } from "./Delegation"

describe("Delegation Slice Selectors", () => {
    const state: RootState = {
        delegation: {
            urls: ["https://example.com", "https://test.com"],
        },
    } as RootState

    describe("selectDelegationState", () => {
        it("should select the delegation slice from the root state", () => {
            expect(selectDelegationState(state)).toEqual(state.delegation)
        })
    })

    describe("selectDelegationUrls", () => {
        it("should select the urls array from the delegation slice", () => {
            expect(selectDelegationUrls(state)).toEqual([
                "https://example.com",
                "https://test.com",
            ])
        })
    })
})
