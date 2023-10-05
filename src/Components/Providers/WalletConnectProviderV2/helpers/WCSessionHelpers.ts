import { Web3WalletTypes } from "@walletconnect/web3wallet/dist/types/types/client"
import {
    addPendingSession,
    addRequest,
    CertificateRequest,
    selectSessionByTopic,
    TransactionRequest,
    WalletConnectPendingSession,
    WalletConnectSession,
} from "~Storage/Redux"
import { AppThunk } from "~Storage/Redux/Types"
import { WalletConnectUtils } from "~Utils"
import { getSdkError } from "@walletconnect/utils"
import { RequestMethods } from "~Constants"
import { ErrorResponse } from "@walletconnect/jsonrpc-utils"
import { JsonRpcError } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import { rpcErrors } from "@metamask/rpc-errors"

const _rejectSession = async (
    id: number,
    reason: ErrorResponse,
): Promise<void> => {
    const web3Wallet = await WalletConnectUtils.getWeb3Wallet()
    await web3Wallet.rejectSession({
        id,
        reason,
    })
}

const _rejectRequest = async (
    topic: string,
    response: JsonRpcError,
): Promise<void> => {
    const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

    await web3Wallet.respondSessionRequest({
        topic,
        response,
    })
}
const onSessionProposal =
    (proposal: Web3WalletTypes.SessionProposal): AppThunk<void> =>
    async dispatch => {
        try {
            const { vechain } = proposal.params.requiredNamespaces
            const { name, url, icons } = proposal.params.proposer.metadata
            const { requiredNamespaces } = proposal.params
            const { verified } = proposal.verifyContext

            if (!vechain) {
                await _rejectSession(
                    proposal.id,
                    getSdkError("INVALID_SESSION_SETTLE_REQUEST"),
                )
                return
            }

            const pendingSession: WalletConnectPendingSession = {
                id: proposal.id,
                dapp: {
                    name,
                    url,
                    icon: icons[0],
                },
                proposalNamespaces: requiredNamespaces,
                verifyContext: verified,
            }

            dispatch(addPendingSession({ pendingSession }))
        } catch (e) {
            await _rejectSession(proposal.id, rpcErrors.internal())
        }
    }

const _onTransactionRequest =
    (
        request: Web3WalletTypes.SessionRequest,
        session: WalletConnectSession,
    ): AppThunk<void> =>
    async dispatch => {
        let message: Connex.Vendor.TxMessage

        try {
            message = WalletConnectUtils.getSendTxMessage(request)
        } catch (e) {
            await _rejectRequest(request.topic, {
                error: rpcErrors.invalidRequest(
                    "The 'Connex.Vendor.TxMessage' is not valid",
                ),
                id: request.id,
                jsonrpc: "2.0",
            })
            return
        }

        const options = WalletConnectUtils.getSendTxOptions(request)

        const txRequest: TransactionRequest = {
            topic: request.topic,
            requestId: request.id,
            message,
            options,
            type: "tx",
            chainId: request.params.chainId,
            account: session.account,
        }

        dispatch(addRequest({ request: txRequest }))
    }

const _onCertificateRequest =
    (
        request: Web3WalletTypes.SessionRequest,
        session: WalletConnectSession,
    ): AppThunk<void> =>
    async dispatch => {
        let message: Connex.Vendor.CertMessage

        try {
            message = WalletConnectUtils.getSignCertMessage(request)
        } catch (e) {
            await _rejectRequest(request.topic, {
                error: rpcErrors.invalidRequest(
                    "The 'Connex.Vendor.CertMessage' is not valid",
                ),
                id: request.id,
                jsonrpc: "2.0",
            })
            return
        }

        const options = WalletConnectUtils.getSignCertOptions(request)

        const certRequest: CertificateRequest = {
            type: "cert",
            topic: request.topic,
            requestId: request.id,
            message,
            options,
            chainId: request.params.chainId,
            account: session.account,
        }

        dispatch(addRequest({ request: certRequest }))
    }
const onSessionRequest =
    (request: Web3WalletTypes.SessionRequest): AppThunk<void> =>
    async (dispatch, getState) => {
        try {
            const { method } = request.params.request

            if (
                method !== RequestMethods.REQUEST_TRANSACTION ||
                method !== RequestMethods.SIGN_CERTIFICATE
            ) {
                await _rejectRequest(request.topic, {
                    error: getSdkError("INVALID_METHOD"),
                    id: request.id,
                    jsonrpc: "2.0",
                })
                return
            }

            const session = selectSessionByTopic(getState(), request.topic)

            if (!session) {
                await _rejectRequest(request.topic, {
                    error: rpcErrors.resourceNotFound(
                        `Session not found: ${request.topic}`,
                    ),
                    id: request.id,
                    jsonrpc: "2.0",
                })
                return
            }

            if (method === RequestMethods.REQUEST_TRANSACTION) {
                await dispatch(_onTransactionRequest(request, session))
            } else {
                await dispatch(_onCertificateRequest(request, session))
            }
        } catch (e) {
            await _rejectRequest(request.topic, {
                error: rpcErrors.internal(),
                id: request.id,
                jsonrpc: "2.0",
            })
        }
    }

export { onSessionProposal, onSessionRequest }
