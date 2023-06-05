import { DelegationType } from "~Model/Delegation"
import {
    DelegationSlice,
    DelegationState,
    addDelegationUrl,
} from "./Delegation"

describe("DelegationSlice", () => {
    let initialState: DelegationState

    beforeEach(() => {
        initialState = {
            urls: [],
            defaultDelegationOption: DelegationType.NONE,
            defaultDelegationAccount: undefined,
            defaultDelegationUrl: undefined,
        }
    })

    it("should add a delegation url to the state", () => {
        const url = "https://example.com"
        const nextState = DelegationSlice.reducer(
            initialState,
            addDelegationUrl(url),
        )
        expect(nextState.urls).toContain(url)
    })
})
