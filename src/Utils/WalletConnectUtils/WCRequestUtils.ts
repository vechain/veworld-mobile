import { PendingRequestTypes } from "@walletconnect/types"
import { warn } from "~Utils"
import HexUtils from "~Utils/HexUtils"

export function getSignCertOptions(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Driver.CertOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        warn("Failed to extract sign cert options", requestEvent, e)
        return {}
    }
}

export function getSignCertMessage(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Vendor.CertMessage {
    const { purpose, payload } = requestEvent.params.request.params[0].message

    if (!purpose)
        throw new Error(`Invalid purpose for sign cert request: ${purpose}`)

    if (!payload || !payload.type || !payload.content)
        throw new Error(
            `Invalid payload for sign cert request: ${JSON.stringify(purpose)}`,
        )

    return {
        purpose,
        payload,
    }
}

export function getSendTxMessage(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Vendor.TxMessage {
    const message: Connex.Vendor.TxMessage =
        requestEvent.params.request.params[0].message

    if (!message || message.length < 1)
        throw new Error(`Invalid message for send tx request: ${message}`)

    return message.map(clause => {
        if (HexUtils.isInvalid(clause?.to) && HexUtils.isInvalid(clause?.data))
            throw new Error(`Invalid clause: ${JSON.stringify(clause)}`)

        clause.data = clause.data || "0x"
        clause.to = clause.to || null
        clause.value = clause.value || "0x0"

        return clause
    })
}

export function getSendTxOptions(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Driver.TxOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        warn("Failed to extract send tx options", requestEvent, e)
        return {}
    }
}
