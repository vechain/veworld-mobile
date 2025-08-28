import { SignedDataRequest } from "~Components/Providers/InAppBrowserProvider/types"
import { RequestMethods } from "~Constants"
import { decodeBase64 } from "tweetnacl-util"
import nacl from "tweetnacl"
import { KeyPair, SessionState } from "~Storage/Redux"
import { BaseTransactionRequest, ExternalAppRequest, TransactionRequest } from "~Model"

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
    if (!["string", "number"].includes(typeof _message.domain.chainId)) return false
    if (!["string", "undefined"].includes(typeof _message.domain.verifyingContract)) return false
    if (typeof _message.domain.name !== "string" || typeof _message.domain.version !== "string") {
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

const generateFaviconUrl = (url: string, { size = 48 }: { size?: number } = {}) => {
    const fullUrl = `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(url).origin}`
    const generatedUrl = new URL(fullUrl)
    generatedUrl.searchParams.set("size", size.toString())
    return generatedUrl.href
}

const validateExternalAppSession = (session: string, signKeyPair: KeyPair) => {
    const sessionKeyPair = nacl.sign.keyPair.fromSecretKey(decodeBase64(signKeyPair.privateKey))

    const decryptedSession = nacl.sign.open(decodeBase64(session), sessionKeyPair.publicKey)

    if (!decryptedSession) {
        return false
    }

    return true
}

const parseSignTxRequest = (
    request: string,
    externalDappSessions: Record<string, SessionState>,
    signKeyPair: KeyPair,
) => {
    const { payload: encPayload, ...decodedRequest }: ExternalAppRequest = JSON.parse(
        new TextDecoder().decode(decodeBase64(request)),
    )

    const session = externalDappSessions[decodedRequest.publicKey]

    if (!session) {
        throw new Error("Session not found")
    }

    const sessionKeyPair = nacl.box.keyPair.fromSecretKey(decodeBase64(session.keyPair.privateKey))

    // Decrypt the payload
    const sharedSecret = nacl.box.before(decodeBase64(decodedRequest.publicKey), sessionKeyPair.secretKey)

    const decryptedPayload = nacl.box.open.after(
        decodeBase64(encPayload),
        decodeBase64(decodedRequest.nonce),
        sharedSecret,
    )

    if (!decryptedPayload) {
        // TODO: Respond to the external app with an error using the error helper
        throw new Error("500 - Invalid payload")
    }

    const payload: {
        transaction: BaseTransactionRequest
        session: string
    } = JSON.parse(new TextDecoder().decode(decryptedPayload))

    if (!payload.session || !validateExternalAppSession(payload.session, signKeyPair)) {
        // TODO: Unauthorized
        throw new Error("401 - Unauthorized")
    }

    const req: TransactionRequest = {
        ...payload.transaction,
        ...decodedRequest,
    }

    return req
}

export const DAppUtils = {
    isValidTxMessage,
    isValidCertMessage,
    getAppHubIconUrl,
    isValidSignedDataMessage,
    generateFaviconUrl,
    parseSignTxRequest,
}
