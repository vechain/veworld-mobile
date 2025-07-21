import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS, TEST_B3TR_ADDRESS, TEST_VOT3_ADDRESS } from "~Constants"
import { AddressUtils, debug } from "~Utils"
import { BalanceState } from "../Slices"

export const Migration23 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 23: Adding dapps notifications state")

    // @ts-ignore
    const currentState: BalanceState = state.balances

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: BalanceState = {
        ...currentState,
        mainnet: Object.fromEntries(
            Object.entries(currentState.mainnet).map(([account, balances]) => [
                account,
                balances.filter(
                    balance =>
                        !AddressUtils.compareAddresses(balance.tokenAddress, TEST_B3TR_ADDRESS) &&
                        !AddressUtils.compareAddresses(balance.tokenAddress, TEST_VOT3_ADDRESS),
                ),
            ]),
        ),
    }

    return {
        ...state,
        balances: newState,
    } as PersistedState
}
