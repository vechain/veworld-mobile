import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { BalanceState } from "../Slices"
import { Balance } from "~Model"

const mapBalances = (obj: Record<string, { hiddenTokenAddresses: string[] } | Balance[]>) =>
    Object.fromEntries(
        Object.entries(obj ?? {}).map((address, balances) => {
            if (Array.isArray(balances))
                return [
                    address,
                    {
                        hiddenTokenAddresses: (balances as Balance[])
                            .filter(bl => bl.isHidden)
                            .map(bl => bl.tokenAddress),
                    },
                ]
            return [address, balances]
        }),
    )

export const Migration28 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 28: Resetting token balance")

    // @ts-ignore
    const currentState: BalanceState = state.balances

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: BalanceState = {
        mainnet: mapBalances(currentState.mainnet),
        other: mapBalances(currentState.other),
        solo: mapBalances(currentState.solo),
        testnet: mapBalances(currentState.testnet),
    }

    return {
        ...state,
        balances: newState,
    } as PersistedState
}
