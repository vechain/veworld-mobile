import { TypedDataDomain } from "@vechain/sdk-network"
import { TypedDataField } from "ethers"
import { SignedDataRequest } from "~Components/Providers/InAppBrowserProvider/types"
import { RequestMethods } from "~Constants"
import { decodeBase64 } from "tweetnacl-util"
import nacl from "tweetnacl"
import { SessionState } from "~Storage/Redux"
import {
    CertificateRequest,
    DecodedRequest,
    DisconnectAppRequest,
    ParsedRequest,
    TransactionRequest,
    TypeDataRequest,
} from "~Model"
import { DeepLinkError, DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { Linking } from "react-native"
import { error } from "~Utils/Logger/Logger"

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

export const isValidSignedData = (
    message: unknown,
): message is {
    domain: TypedDataDomain
    types: Record<string, TypedDataField[]>
    value: Record<string, unknown>
} => {
    if (message === null || message === undefined || typeof message !== "object" || Array.isArray(message)) {
        return false
    }
    const _message: Partial<{
        domain: TypedDataDomain
        types: Record<string, TypedDataField[]>
        value: Record<string, unknown>
    }> = message
    if (!_message.domain || !_message.types || !_message.value) {
        return false
    }
    if (!["string", "number"].includes(typeof _message.domain.chainId)) return false
    if (!["string", "undefined"].includes(typeof _message.domain.verifyingContract)) return false
    if (typeof _message.domain.name !== "string" || typeof _message.domain.version !== "string") {
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

/**
 * Encrypt the payload with the shared secret of the session
 * @param payload - JSON stringified payload
 * @returns The nonce and encrypted payload
 */
const encryptPayload = (payload: string, publicKey: string, secretKey: string): [Uint8Array, Uint8Array] => {
    const nonce = nacl.randomBytes(24)
    const payloadBytes = new TextEncoder().encode(payload)
    const encryptedPayload = nacl.box(payloadBytes, nonce, decodeBase64(publicKey), decodeBase64(secretKey))

    return [nonce, encryptedPayload]
}

const decodeRequest = (encodedRequest: string): DecodedRequest => {
    const request = decodeURIComponent(encodedRequest)
    return JSON.parse(new TextDecoder().decode(decodeBase64(request))) as DecodedRequest
}

const parseRequest = async <T>(
    decodedRequest: DecodedRequest,
    externalDappSessions: Record<string, SessionState>,
    redirectUrl: string,
): Promise<ParsedRequest<T> | undefined> => {
    const { payload: encPayload, ...request } = decodedRequest
    try {
        const dappSession = externalDappSessions[request.publicKey]

        if (!dappSession) {
            const err = new DeepLinkError(DeepLinkErrorCode.Unauthorized)
            await Linking.openURL(
                `${redirectUrl}?errorMessage=${encodeURIComponent(err.message)}&errorCode=${err.code}`,
            )
            return
        }

        const KP = nacl.box.keyPair.fromSecretKey(decodeBase64(dappSession.keyPair.privateKey))

        // Decrypt the payload
        const sharedSecret = nacl.box.before(decodeBase64(request.publicKey), KP.secretKey)

        const decryptedPayload = nacl.box.open.after(
            decodeBase64(encPayload),
            decodeBase64(request.nonce),
            sharedSecret,
        )

        if (!decryptedPayload) {
            const err = new DeepLinkError(DeepLinkErrorCode.InvalidPayload)
            await Linking.openURL(`${redirectUrl}?erroMessage=${encodeURIComponent(err.message)}&errorCode=${err.code}`)
            return
        }

        const payload = JSON.parse(new TextDecoder().decode(decryptedPayload))

        return { payload, request } as ParsedRequest<T>
    } catch {
        const err = new DeepLinkError(DeepLinkErrorCode.InternalError)
        error("EXTERNAL_DAPP_CONNECTION", err)
        await Linking.openURL(`${redirectUrl}?errorMessage=${err.message}&errorCode=${err.code}`)
        return
    }
}

const parseTransactionRequest = async (
    decodedRequest: DecodedRequest,
    externalDappSessions: Record<string, SessionState>,
    redirectUrl: string,
): Promise<TransactionRequest | undefined> => {
    const parsedRequest = await parseRequest<TransactionRequest>(decodedRequest, externalDappSessions, redirectUrl)

    if (!parsedRequest) {
        throw new DeepLinkError(DeepLinkErrorCode.InternalError)
    }

    if (!("transaction" in parsedRequest.payload)) {
        const err = new DeepLinkError(DeepLinkErrorCode.InvalidPayload)
        const params = new URLSearchParams({
            errorMessage: err.message,
            errorCode: err.code.toString(),
        })
        await Linking.openURL(`${redirectUrl}?${params.toString()}`)
        return
    }

    return {
        ...parsedRequest.payload.transaction,
        ...parsedRequest.request,
        session: parsedRequest.payload.session,
    } as TransactionRequest
}

const parseTypedDataRequest = async (
    decodedRequest: DecodedRequest,
    externalDappSessions: Record<string, SessionState>,
    redirectUrl: string,
): Promise<TypeDataRequest | undefined> => {
    const parsedRequest = await parseRequest<TypeDataRequest>(decodedRequest, externalDappSessions, redirectUrl)

    if (!parsedRequest) {
        throw new DeepLinkError(DeepLinkErrorCode.InternalError)
    }

    if (!("typedData" in parsedRequest.payload)) {
        const err = new DeepLinkError(DeepLinkErrorCode.InvalidPayload)
        const params = new URLSearchParams({
            errorMessage: err.message,
            errorCode: err.code.toString(),
        })
        await Linking.openURL(`${redirectUrl}?${params.toString()}`)
        return
    }

    return {
        ...parsedRequest.payload.typedData,
        ...parsedRequest.request,
        session: parsedRequest.payload.session,
    } as TypeDataRequest
}

const parseCertificateRequest = async (
    decodedRequest: DecodedRequest,
    externalDappSessions: Record<string, SessionState>,
    redirectUrl: string,
): Promise<CertificateRequest | undefined> => {
    const parsedRequest = await parseRequest<CertificateRequest>(decodedRequest, externalDappSessions, redirectUrl)

    if (!parsedRequest) {
        throw new DeepLinkError(DeepLinkErrorCode.InternalError)
    }

    if (!("certificate" in parsedRequest.payload)) {
        const err = new DeepLinkError(DeepLinkErrorCode.InvalidPayload)
        const params = new URLSearchParams({
            errorMessage: err.message,
            errorCode: err.code.toString(),
        })
        await Linking.openURL(`${redirectUrl}?${params.toString()}`)
        return
    }

    return {
        ...parsedRequest.payload.certificate,
        ...parsedRequest.request,
        session: parsedRequest.payload.session,
    } as CertificateRequest
}

const parseDisconnectRequest = async (
    decodedRequest: DecodedRequest,
    externalDappSessions: Record<string, SessionState>,
    redirectUrl: string,
): Promise<DisconnectAppRequest | undefined> => {
    const parsedRequest = await parseRequest<DisconnectAppRequest>(decodedRequest, externalDappSessions, redirectUrl)

    if (!parsedRequest) {
        throw new DeepLinkError(DeepLinkErrorCode.InternalError)
    }

    if (!("session" in parsedRequest.payload)) {
        const err = new DeepLinkError(DeepLinkErrorCode.InvalidPayload)
        const params = new URLSearchParams({
            errorMessage: err.message,
            errorCode: err.code.toString(),
        })
        await Linking.openURL(`${redirectUrl}?${params.toString()}`)
        return
    }

    return { ...parsedRequest.request, session: parsedRequest.payload.session } as DisconnectAppRequest
}

const dispatchResourceNotAvailableError = (redirectUrl: string) => {
    const err = new DeepLinkError(DeepLinkErrorCode.ResourceNotAvailable)
    const params = new URLSearchParams({
        errorMessage: err.message,
        errorCode: err.code.toString(),
    })
    Linking.openURL(`${redirectUrl}?${params.toString()}`)
}

const dispatchInternalError = (redirectUrl: string) => {
    const err = new DeepLinkError(DeepLinkErrorCode.InternalError)
    const params = new URLSearchParams({
        errorMessage: err.message,
        errorCode: err.code.toString(),
    })
    Linking.openURL(`${redirectUrl}?${params.toString()}`)
}

const dispatchExternalAppError = (redirectUrl: string, err: DeepLinkError) => {
    const params = new URLSearchParams({
        errorMessage: err.message,
        errorCode: err.code.toString(),
    })
    Linking.openURL(`${redirectUrl}?${params.toString()}`)
}

// Generate stable ID from URL (e.g. "https://app.vechain.org/dashboard" -> "app_vechain_org_dashboard")
const generateDAppId = (href: string): string => {
    try {
        const url = new URL(href)
        return `${url.hostname}${url.pathname}`.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase()
    } catch {
        return href.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase()
    }
}

export const DAppUtils = {
    isValidTxMessage,
    isValidCertMessage,
    getAppHubIconUrl,
    isValidSignedDataMessage,
    generateFaviconUrl,
    isValidSignedData,
    parseTransactionRequest,
    parseTypedDataRequest,
    parseCertificateRequest,
    parseDisconnectRequest,
    encryptPayload,
    dispatchResourceNotAvailableError,
    dispatchInternalError,
    dispatchExternalAppError,
    decodeRequest,
    generateDAppId,
}
