import { PersistedState } from "redux-persist/es/types"
import { B3TR, ERROR_EVENTS, TEST_B3TR_ADDRESS, TEST_VOT3_ADDRESS, VET, VOT3 } from "~Constants"
import { AddressUtils, debug } from "~Utils"
import { BalanceState } from "../Slices"
import { Balance } from "~Model"

const ONE_HOUR = 60 * 60 * 1000

/**
 *
 * @param balanceFilter Filter function that should return true if the item should be excluded, false otherwise
 * @returns Map-like function, that filters out what described by {@link balanceFilter} and all the balances that have a difference of more than 1 hour from the VET balance update.
 */
const mapFn =
    (balanceFilter?: (balance: Balance) => boolean) =>
    ([account, balances]: [string, Balance[]]) => {
        const vetBalance = balances.find(b => b.tokenAddress === VET.address)
        if (!vetBalance) return [account, balances]
        return [
            account,
            balances.filter(balance => {
                if (balanceFilter?.(balance)) return false
                if (new Date(vetBalance.timeUpdated).getTime() - new Date(balance.timeUpdated).getTime() >= ONE_HOUR)
                    return false
                return true
            }),
        ]
    }

export const Migration23 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 23: Adding dapps notifications state")

    // @ts-ignore
    const currentState: BalanceState = state.balances

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const mainnetMapFn = mapFn(
        balance =>
            AddressUtils.compareAddresses(balance.tokenAddress, TEST_B3TR_ADDRESS) ||
            AddressUtils.compareAddresses(balance.tokenAddress, TEST_VOT3_ADDRESS),
    )
    const testnetMapFn = mapFn(
        balance =>
            AddressUtils.compareAddresses(balance.tokenAddress, B3TR.address) ||
            AddressUtils.compareAddresses(balance.tokenAddress, VOT3.address),
    )

    const newState: BalanceState = {
        mainnet: Object.fromEntries(Object.entries(currentState.mainnet).map(mainnetMapFn)),
        testnet: Object.fromEntries(Object.entries(currentState.testnet).map(testnetMapFn)),
        solo: Object.fromEntries(Object.entries(currentState.solo).map(mapFn())),
        other: Object.fromEntries(Object.entries(currentState.other).map(mapFn())),
    }

    return {
        ...state,
        balances: newState,
    } as PersistedState
}
