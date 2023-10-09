import {
    removeRequest,
    useAppDispatch,
    WalletConnectRequest,
} from "~Storage/Redux"
import {
    ErrorResponse,
    JsonRpcResult,
} from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import { WalletConnectService } from "~Services"
import { useCallback } from "react"
import { Certificate } from "thor-devkit"
import { getSdkError } from "@walletconnect/utils"

export const useWcRequests = (request?: WalletConnectRequest) => {
    const dispatch = useAppDispatch()

    const respondRequest = useCallback(
        async <T>(response: JsonRpcResult<T>["result"]) => {
            if (!request) return

            await WalletConnectService.respondToRequest(request, response)

            dispatch(removeRequest({ requestId: request.requestId }))
        },
        [request, dispatch],
    )

    const respondTransactionRequest = useCallback(
        async (result: Connex.Vendor.TxResponse) => {
            await respondRequest(result)
        },
        [respondRequest],
    )

    const respondSignCertRequest = useCallback(
        async (cert: Certificate, signature: string) => {
            const res: Connex.Vendor.CertResponse = {
                annex: {
                    domain: cert.domain,
                    timestamp: cert.timestamp,
                    signer: cert.signer,
                },
                signature: signature,
            }

            await respondRequest(res)
        },
        [respondRequest],
    )

    const rejectRequest = useCallback(
        async (error: ErrorResponse) => {
            if (!request) return

            await WalletConnectService.rejectRequest(
                request.requestId,
                request.topic,
                error,
            )

            dispatch(removeRequest({ requestId: request.requestId }))
        },
        [dispatch, request],
    )

    const userRejectedRequest = useCallback(async () => {
        const error = getSdkError("USER_REJECTED")

        await rejectRequest(error)
    }, [rejectRequest])

    return {
        respondTransactionRequest,
        respondSignCertRequest,
        respondRequest,
        rejectRequest,
        userRejectedRequest,
    }
}
