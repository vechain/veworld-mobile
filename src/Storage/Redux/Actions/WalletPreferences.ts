import { Dispatch } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedAccount, selectSelectedNetwork } from "../Selectors"
import { warn } from "~Utils/Logger"
import AccountUtils from "~Utils/AccountUtils"
import { ERROR_EVENTS, VET } from "~Constants"
import { setLastSentToken, setLastValidatorExited } from "../Slices"
import moment from "moment"
import { Transaction } from "@vechain/sdk-core"
import { TransactionUtils } from "~Utils"

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

const getTokenAddressFromTransferClause = (clause: Connex.VM.Clause) => {
    if (TransactionUtils.isVETtransferClause(clause)) {
        return VET.address
    } else if (TransactionUtils.isTokenTransferClause(clause)) {
        return clause.to
    }
}

export const setLastSentTokenAction = (transaction: Transaction) => (dispatch: Dispatch, getState: () => RootState) => {
    const selectedNetwork = selectSelectedNetwork(getState())
    const selectedAccount = selectSelectedAccount(getState())

    if (!selectedNetwork.genesis.id || !selectedAccount.address) {
        warn(ERROR_EVENTS.WALLET_PREFERENCES, "Selected network or account not found")
        return
    }

    if (AccountUtils.isObservedAccount(selectedAccount)) {
        warn(ERROR_EVENTS.WALLET_PREFERENCES, "Cannot set last sent token for observed account")
        return
    }

    const contractAddress = getTokenAddressFromTransferClause(transaction.body.clauses[0])?.toLowerCase()

    if (!contractAddress) {
        warn(ERROR_EVENTS.WALLET_PREFERENCES, "Cannot set last sent token for invalid clause")
        return
    }

    dispatch(
        setLastSentToken({
            genesisId: selectedNetwork.genesis.id,
            from: selectedAccount.address,
            contractAddress,
        }),
    )
}
