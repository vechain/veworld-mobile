import { RootState } from "../Types"
import { selectDelegationState, selectDelegationUrls } from "./Delegation"
import { DelegationState } from "~Storage/Redux"
import { defaultMainNetwork } from "~Constants"
import { DelegationType } from "~Model/Delegation"

describe("Delegation Slice Selectors", () => {
    const delegation: Record<string, DelegationState> = {
        [defaultMainNetwork.genesis.id]: {
            urls: ["https://example.com", "https://test.com"],
            defaultDelegationOption: DelegationType.NONE,
        },
    }

    // @ts-ignore
    const state: RootState = {
        delegation,
        networks: {
            customNetworks: [],
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
