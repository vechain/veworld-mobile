import { DelegationType } from "~Model/Delegation"
import { addDelegationUrl, DelegationSlice, DelegationState, setDefaultDelegationToken } from "./Delegation"
import { defaultMainNetwork, defaultTestNetwork, VTHO } from "~Constants/Constants"

describe("DelegationSlice", () => {
    let initialState: Record<string, DelegationState> = {}

    beforeEach(() => {
        initialState[defaultMainNetwork.genesis.id] = {
            urls: [],
            defaultDelegationOption: DelegationType.NONE,
            defaultDelegationAccount: undefined,
            defaultDelegationUrl: undefined,
            defaultToken: VTHO.symbol,
        }
    })

    it("should add a delegation url to the state", () => {
        const url = "https://example.com"
        const nextState = DelegationSlice.reducer(
            initialState,
            addDelegationUrl({
                url,
                genesisId: defaultMainNetwork.genesis.id,
                callbackIfAlreadyPresent: () => {},
            }),
        )
        expect(nextState[defaultMainNetwork.genesis.id].urls).toContain(url)
    })

    describe("Delegation token", () => {
        it("should set the default delegation token on an existing network", () => {
            const nextState = DelegationSlice.reducer(
                initialState,
                setDefaultDelegationToken({
                    token: "VET",
                    genesisId: defaultMainNetwork.genesis.id,
                }),
            )
            expect(nextState[defaultMainNetwork.genesis.id].defaultToken).toBe("VET")
        })
        it("should set the default delegation token on a non existing network", () => {
            const nextState = DelegationSlice.reducer(
                initialState,
                setDefaultDelegationToken({
                    token: "VET",
                    genesisId: defaultTestNetwork.genesis.id,
                }),
            )
            expect(nextState[defaultTestNetwork.genesis.id].defaultToken).toBe("VET")
        })
    })
})
