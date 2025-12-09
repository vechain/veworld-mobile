import { Dispatch } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedAccount, selectSelectedNetwork } from "../Selectors"
import { warn } from "~Utils/Logger"
import AccountUtils from "~Utils/AccountUtils"
import { ERROR_EVENTS } from "~Constants"
import { setLastValidatorExited } from "../Slices"
import moment from "moment"

export const setLastValidatorExit = () => (dispatch: Dispatch, getState: () => RootState) => {
    const selectedNetwork = selectSelectedNetwork(getState())
    const selectedAccount = selectSelectedAccount(getState())
    const timestamp = moment().unix()

    if (!selectedNetwork.genesis.id || !selectedAccount.address) {
        warn(ERROR_EVENTS.WALLET_PREFERENCES, "Selected network or account not found")
        return
    }

    if (AccountUtils.isObservedAccount(selectedAccount)) {
        warn(ERROR_EVENTS.WALLET_PREFERENCES, "Cannot set last validator exited for observed account")
        return
    }

    dispatch(
        setLastValidatorExited({
            genesisId: selectedNetwork.genesis.id,
            address: selectedAccount.address,
            timestamp,
        }),
    )
}
