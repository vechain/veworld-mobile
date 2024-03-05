const isValidTxMessage = (message: unknown): message is Connex.Vendor.TxMessage => {
    if (!Array.isArray(message)) {
        return false
    }

    if (message.length < 1) {
        return false
    }

    for (const item of message) {
        if (typeof item !== "object") {
            return false
        }

        if (typeof item.to !== "string" && item.to !== null) {
            return false
        }

        if (typeof item.value !== "string" && typeof item.value !== "number") {
            return false
        }

        if (typeof item.data !== "string" && item.data !== null && item.data !== undefined) {
            return false
        }
    }

    return true
}

const isValidCertMessage = (message: unknown): message is Connex.Vendor.CertMessage => {
    if (message === null || message === undefined || typeof message !== "object" || Array.isArray(message)) {
        return false
    }

    const _message: Partial<Connex.Vendor.CertMessage> = message

    if (!_message.purpose || !_message.payload) {
        return false
    }

    if (_message.purpose !== "identification" && _message.purpose !== "agreement") {
        return false
    }

    if (!_message.payload.type || !_message.payload.content) {
        return false
    }

    if (_message.payload.type !== "text") {
        return false
    }

    if (!_message.payload.content) {
        return false
    }

    return true
}

export const DAppUtils = {
    isValidTxMessage,
    isValidCertMessage,
}
