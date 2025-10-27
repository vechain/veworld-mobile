import { PersistedState } from "redux-persist/es/types"
import { B3TR, ERROR_EVENTS, TEST_B3TR_ADDRESS, TEST_VOT3_ADDRESS, VOT3 } from "~Constants"
import { debug } from "~Utils"
import { BalanceState } from "../Slices"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { Balance } from "~Model"

export const Migration20 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 20: Adding version update state")

    // @ts-ignore
    const currentState: BalanceState = state.balances

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: BalanceState = {
        ...currentState,
        //@ts-expect-error
        testnet: Object.entries(currentState.testnet).reduce((acc: Record<string, Balance[]>, [address, balance]) => {
            //@ts-expect-error
            const hasB3TR = balance.find(b => compareAddresses(b.tokenAddress, TEST_B3TR_ADDRESS))
            //@ts-expect-error
            const hasVOT3 = balance.find(b => compareAddresses(b.tokenAddress, TEST_B3TR_ADDRESS))

            if (!hasB3TR) {
                acc[address] = [
                    //@ts-expect-error
                    ...balance,
                    {
                        balance: "0",
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: TEST_B3TR_ADDRESS,
                        isCustomToken: false,
                        tokenDecimals: B3TR.decimals,
                        tokenName: B3TR.name,
                        tokenSymbol: B3TR.symbol,
                    } as Balance,
                ]
            }
            if (!hasVOT3) {
                acc[address] = [
                    //@ts-expect-error
                    ...balance,
                    {
                        balance: "0",
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: TEST_VOT3_ADDRESS,
                        isCustomToken: false,
                        tokenDecimals: VOT3.decimals,
                        tokenName: VOT3.name,
                        tokenSymbol: VOT3.symbol,
                    } as Balance,
                ]
            }
            return acc
        }, {}),
    }

    return {
        ...state,
        balances: newState,
    } as PersistedState
}
