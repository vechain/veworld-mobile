import { SignedDataRequest } from "~Components/Providers/InAppBrowserProvider/types"
import { RequestMethods } from "~Constants"

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

export const isValidSignedDataMessage = (message: unknown): message is SignedDataRequest => {
    if (message === null || message === undefined || typeof message !== "object" || Array.isArray(message)) {
        return false
    }

    const _message: Partial<SignedDataRequest> = message

    if (
        !_message.domain ||
        !_message.genesisId ||
        !_message.id ||
        !_message.method ||
        !_message.origin ||
        !_message.types ||
        !_message.value
    ) {
        return false
    }

    if (
        typeof _message.domain.chainId !== "string" ||
        typeof _message.domain.name !== "string" ||
        typeof _message.domain.verifyingContract !== "string" ||
        typeof _message.domain.version !== "string"
    ) {
        return false
    }

    if (typeof _message.genesisId !== "string") {
        return false
    }

    if (typeof _message.id !== "string") {
        return false
    }

    if (_message.method !== RequestMethods.SIGN_TYPED_DATA) {
        return false
    }

    if (typeof _message.origin !== "string") {
        return false
    }

    if (typeof _message.types !== "object") {
        return false
    }

    if (typeof _message.value !== "object") {
        return false
    }

    return true
}

export const getAppHubIconUrl = (appId: string) => {
    return `${process.env.REACT_APP_HUB_URL}/imgs/${appId}.png`
}

export const DAppUtils = {
    isValidTxMessage,
    isValidCertMessage,
    getAppHubIconUrl,
    isValidSignedDataMessage,
}
