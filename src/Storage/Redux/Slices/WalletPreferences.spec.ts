import { defaultMainNetwork } from "~Constants/Constants"
import { initialWalletPreferencesState, setLastValidatorExited, WalletPreferencesSlice } from "./WalletPreferences"

describe("WalletPreferences", () => {
    describe("setLastValidatorExited", () => {
        it("should set the last validator exited timestamp", () => {
            const state = WalletPreferencesSlice.reducer(
                initialWalletPreferencesState,
                setLastValidatorExited({
                    genesisId: defaultMainNetwork.genesis.id,
                    address: "0x1234",
                    timestamp: 1717987200,
                }),
            )

            expect(state[defaultMainNetwork.genesis.id]["0x1234"].lastValidatorExitedAt).toBe(1717987200)
        })

        it("should set the last validator exited timestamp for a new address", () => {
            const state = WalletPreferencesSlice.reducer(
                {
                    ...initialWalletPreferencesState,
                    [defaultMainNetwork.genesis.id]: {
                        ...initialWalletPreferencesState[defaultMainNetwork.genesis.id],
                        "0x1234": {
                            lastValidatorExitedAt: 1717987200,
                        },
                    },
                },

                setLastValidatorExited({
                    genesisId: defaultMainNetwork.genesis.id,
                    address: "0x16834",
                    timestamp: 1717987159,
                }),
            )

            expect(state[defaultMainNetwork.genesis.id]["0x16834"].lastValidatorExitedAt).toBe(1717987159)
        })

        it("should set the last validator exited timestamp for a new network", () => {
            const state = WalletPreferencesSlice.reducer(
                initialWalletPreferencesState,
                setLastValidatorExited({
                    genesisId: "devnet-1",
                    address: "0x1234",
                    timestamp: 1717987009,
                }),
            )

            expect(state["devnet-1"]["0x1234"].lastValidatorExitedAt).toBe(1717987009)
        })
    })
})
