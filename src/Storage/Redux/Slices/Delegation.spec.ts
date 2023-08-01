import { DelegationType } from "~Model/Delegation"
import {
    addDelegationUrl,
    DelegationSlice,
    DelegationState,
} from "./Delegation"
import { defaultMainNetwork } from "~Constants"

describe("DelegationSlice", () => {
    let initialState: Record<string, DelegationState> = {}

    beforeEach(() => {
        initialState[defaultMainNetwork.genesis.id] = {
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
            addDelegationUrl({ url, genesisId: defaultMainNetwork.genesis.id }),
        )
        expect(nextState[defaultMainNetwork.genesis.id].urls).toContain(url)
    })
})
