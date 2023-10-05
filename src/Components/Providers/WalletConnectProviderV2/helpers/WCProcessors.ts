import { AppThunk } from "~Storage/Redux/Types"
import { SessionTypes } from "@walletconnect/types"
import { WalletConnectUtils } from "~Utils"
import {
    removePendingSession,
    upsertSession,
    WalletConnectSession,
} from "~Storage/Redux"
import { Verify } from "@walletconnect/types/dist/types/core/verify"
import { getSdkError } from "@walletconnect/utils"

const approveSession =
    (
        id: number,
        namespaces: Record<string, SessionTypes.Namespace>,
        verifyContext: Verify.Context["verified"],
        account: string,
    ): AppThunk<void> =>
    async dispatch => {
        const web3Wallet = await WalletConnectUtils.getWeb3Wallet()
        const session = await web3Wallet.approveSession({
            id,
            namespaces,
        })

        const wcSession: WalletConnectSession = {
            topic: session.topic,
            chains: namespaces.vechain.chains ?? [],
            verifyContext,
            namespaces,
            account,
        }

        dispatch(removePendingSession())
        dispatch(upsertSession({ wcSession }))
    }

const rejectSession =
    (id: number): AppThunk<void> =>
    async dispatch => {
        const web3Wallet = await WalletConnectUtils.getWeb3Wallet()
        await web3Wallet.rejectSession({
            id,
            reason: getSdkError("USER_REJECTED"),
        })
        dispatch(removePendingSession())
    }

export { approveSession, rejectSession }
