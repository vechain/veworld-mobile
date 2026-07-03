import axios from "axios"
import { useCallback } from "react"
import { Certificate } from "@vechain/sdk-core"
import { B3MO_BACKEND_URL, B3MO_CERT_DOMAIN, B3MO_CERT_PURPOSE } from "~Constants"
import { selectAccounts, selectDevice, setB3moJwt, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectB3moLinkedAddress, selectB3moSessionPassword } from "~Storage/Redux/Selectors/B3mo"
import { DEVICE_TYPE, type LocalDevice } from "~Model"
import { decryptWalletWithKey, derivePrivateKey } from "./walletAccess"

type ChallengeResponse = {
    nonce: string
    message: string
    domain: string
    purpose: string
    ttlSeconds: number
}

type VerifyResponse = {
    token: string
    walletAddress: string
    expiresIn: string
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export const useB3moAuth = () => {
    const dispatch = useAppDispatch()
    const linkedAddress = useAppSelector(selectB3moLinkedAddress)
    const sessionWalletKey = useAppSelector(selectB3moSessionPassword)
    const accounts = useAppSelector(selectAccounts)

    const account = linkedAddress
        ? accounts.find(a => a.address.toLowerCase() === linkedAddress.toLowerCase())
        : undefined
    const device = useAppSelector(state => (account ? selectDevice(state, account.rootAddress) : undefined))

    const signIn = useCallback(
        async (walletKeyOverride?: string): Promise<string> => {
            const walletKey = walletKeyOverride ?? sessionWalletKey
            if (!linkedAddress) throw new Error("B3MO is not linked to a wallet yet")
            if (!walletKey) throw new Error("B3MO session is locked. Unlock first.")
            if (!device || device.type !== DEVICE_TYPE.LOCAL_MNEMONIC) {
                throw new Error("Linked wallet must be a local mnemonic device")
            }
            if (!account) throw new Error("Account for linked B3MO address not found")

            const challenge = await axios
                .post<ChallengeResponse>(`${B3MO_BACKEND_URL}/auth/challenge`, {
                    walletAddress: linkedAddress,
                })
                .then(r => r.data)

            const wallet = await decryptWalletWithKey((device as LocalDevice).wallet, walletKey)
            const privateKey = derivePrivateKey(wallet, account.index)

            const cert = Certificate.of({
                purpose: B3MO_CERT_PURPOSE,
                payload: { type: "text", content: challenge.message },
                domain: B3MO_CERT_DOMAIN,
                timestamp: Math.floor(Date.now() / 1000),
                signer: linkedAddress,
            })
            cert.sign(new Uint8Array(privateKey))

            const verifyRes = await axios
                .post<VerifyResponse>(`${B3MO_BACKEND_URL}/auth/verify`, {
                    walletAddress: linkedAddress,
                    certificate: {
                        purpose: cert.purpose,
                        payload: cert.payload,
                        domain: cert.domain,
                        timestamp: cert.timestamp,
                        signer: cert.signer,
                        signature: cert.signature,
                    },
                })
                .then(r => r.data)

            dispatch(
                setB3moJwt({
                    jwt: verifyRes.token,
                    expiresAt: Date.now() + SEVEN_DAYS_MS,
                }),
            )

            return verifyRes.token
        },
        [linkedAddress, sessionWalletKey, device, account, dispatch],
    )

    return { signIn }
}
