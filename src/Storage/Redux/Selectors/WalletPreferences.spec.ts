import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { TestHelpers } from "~Test"
import { RootState } from "../Types"
import { selectLastValidatorExited } from "./WalletPreferences"

const { account1D1, account2D1, account1D2, device1, device2 } = TestHelpers.data

const state: Partial<RootState> = {
    networks: {
        selectedNetwork: defaultMainNetwork.id,
        customNetworks: [],
        showTestNetTag: false,
        showConversionOtherNets: false,
        isNodeError: false,
        hardfork: {},
    },
    accounts: {
        accounts: [account1D1, account2D1, account1D2],
        selectedAccount: account1D1.address,
    },
    devices: [device1, device2],
    walletPreferences: {
        [defaultMainNetwork.genesis.id]: {
            [account1D1.address]: {
                lastValidatorExitedAt: 1717987200,
            },
            [account2D1.address]: {
                lastValidatorExitedAt: 1717987100,
            },
            [account1D2.address]: {
                lastValidatorExitedAt: undefined,
            },
        },
        [defaultTestNetwork.genesis.id]: {},
    },
}

describe("WalletPreferences", () => {
    describe("selectLastValidatorExited", () => {
        it("should return the last validator exited timestamp", () => {
            expect(selectLastValidatorExited(state as RootState)).toBe(1717987200)
        })

        it("should return undefined if the last validator exited timestamp is not set", () => {
            const newState = {
                ...state,
                accounts: {
                    ...state.accounts,
                    selectedAccount: account1D2.address,
                },
            }
            expect(selectLastValidatorExited(newState as RootState)).toBe(undefined)
        })
    })
})
