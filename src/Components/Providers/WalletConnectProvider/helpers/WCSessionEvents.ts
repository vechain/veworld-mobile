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
import { warn, WCRequestUtils } from "~Utils"
import { getSdkError } from "@walletconnect/utils"
import { RequestMethods } from "~Constants"
import { JsonRpcError } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import { rpcErrors } from "@metamask/rpc-errors"
import WalletConnectService from "~Services/WalletConnectService/WalletConnectService"

const _rejectRequest = async (
    requestId: number,
    topic: string,
    response: JsonRpcError["error"],
): Promise<void> => {
    await WalletConnectService.rejectRequest(requestId, topic, response)
}

const _onTransactionRequest =
    (
        request: Web3WalletTypes.SessionRequest,
        session: WalletConnectSession,
    ): AppThunk<void> =>
    async dispatch => {
        let message: Connex.Vendor.TxMessage

        try {
            message = WCRequestUtils.getSendTxMessage(request)
        } catch (e) {
            await _rejectRequest(
                request.id,
                request.topic,
                rpcErrors.invalidRequest(
                    "The 'Connex.Vendor.TxMessage' is not valid",
                ),
            )
            return
        }

        const options = WCRequestUtils.getSendTxOptions(request)

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
            message = WCRequestUtils.getSignCertMessage(request)
        } catch (e) {
            await _rejectRequest(
                request.id,
                request.topic,
                rpcErrors.invalidRequest(
                    "The 'Connex.Vendor.CertMessage' is not valid",
                ),
            )
            return
        }

        const options = WCRequestUtils.getSignCertOptions(request)

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

            warn("onSessionRequest", method)

            if (!Object.values(RequestMethods).includes(method)) {
                await _rejectRequest(
                    request.id,
                    request.topic,
                    getSdkError("INVALID_METHOD"),
                )
                return
            }

            const session = selectSessionByTopic(getState(), request.topic)

            warn("onSessionRequest", session?.topic)

            if (!session) {
                await _rejectRequest(
                    request.id,
                    request.topic,
                    rpcErrors.resourceNotFound(
                        `Session not found: ${request.topic}`,
                    ),
                )
                return
            }

            if (method === RequestMethods.REQUEST_TRANSACTION) {
                await dispatch(_onTransactionRequest(request, session))
            } else {
                await dispatch(_onCertificateRequest(request, session))
            }
        } catch (e) {
            await _rejectRequest(
                request.id,
                request.topic,
                rpcErrors.internal(),
            )
        }
    }
const onSessionProposal =
    (proposal: Web3WalletTypes.SessionProposal): AppThunk<void> =>
    async dispatch => {
        try {
            const { vechain } = proposal.params.requiredNamespaces
            const { verified } = proposal.verifyContext

            if (!vechain) {
                await WalletConnectService.rejectSession(
                    proposal.id,
                    getSdkError("INVALID_SESSION_SETTLE_REQUEST"),
                )
                return
            }

            const pendingSession: WalletConnectPendingSession = {
                id: proposal.id,
                dAppMetadata: proposal.params.proposer.metadata,
                namespace: vechain,
                verifyContext: verified,
            }

            dispatch(addPendingSession({ pendingSession }))
        } catch (e) {
            await WalletConnectService.rejectSession(
                proposal.id,
                rpcErrors.internal(),
            )
        }
    }

export { onSessionProposal, onSessionRequest }
