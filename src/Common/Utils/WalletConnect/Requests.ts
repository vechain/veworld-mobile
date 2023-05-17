import { VECHAIN_SIGNING_METHODS } from "./Lib"
import { formatJsonRpcError } from "@json-rpc-tools/utils"
import { SignClientTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"

export async function approveRequest(
    requestEvent: SignClientTypes.EventArguments["session_request"],
) {
    const { params } = requestEvent
    const { request } = params

    switch (request.method) {
        case VECHAIN_SIGNING_METHODS.PERSONAL_SIGN: {
            // console.log("personal sign request", request.params)

            //TODO: sign message with wallet
            // const signedMessage = await wallet.signMessage(message);
            // return formatJsonRpcResult(id, signedMessage);

            break
        }

        default:
            throw new Error(getSdkError("INVALID_METHOD").message)
    }
}

export function rejectRequest(
    request: SignClientTypes.EventArguments["session_request"],
) {
    const { id } = request

    return formatJsonRpcError(id, getSdkError("USER_REJECTED_METHODS").message)
}
