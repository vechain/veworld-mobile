import axios from "axios"
import { useCallback } from "react"
import { Address, Secp256k1, Transaction } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { B3MO_BACKEND_URL } from "~Constants"
import { selectAccounts, selectCustomNetworks, selectDevice, selectNetworks, useAppSelector } from "~Storage/Redux"
import { selectB3moJwt, selectB3moLinkedAddress, selectB3moSessionPassword } from "~Storage/Redux/Selectors/B3mo"
import { DEVICE_TYPE, NETWORK_TYPE, type LocalDevice } from "~Model"
import { HexUtils } from "~Utils"
import { decryptWalletWithKey, derivePrivateKey } from "./walletAccess"

export type B3moClause = {
    to: string
    value: string
    data: string
    comment?: string
}

export type B3moExecParams = {
    sessionId: string
    toolCallId: string
    network: "mainnet" | "testnet"
    clauses: B3moClause[]
    gasHint?: number
}

export type B3moExecResult = { success: true; txId: string } | { success: false; error: string }

export const useB3moExecutor = () => {
    const linkedAddress = useAppSelector(selectB3moLinkedAddress)
    const walletKey = useAppSelector(selectB3moSessionPassword)
    const accounts = useAppSelector(selectAccounts)
    const networks = useAppSelector(selectNetworks)
    const customNetworks = useAppSelector(selectCustomNetworks)
    const account = linkedAddress
        ? accounts.find(a => a.address.toLowerCase() === linkedAddress.toLowerCase())
        : undefined
    const device = useAppSelector(state => (account ? selectDevice(state, account.rootAddress) : undefined))
    const jwt = useAppSelector(selectB3moJwt)

    const execute = useCallback(
        async (params: B3moExecParams): Promise<B3moExecResult> => {
            try {
                if (!linkedAddress) throw new Error("B3MO not linked")
                if (!walletKey) throw new Error("B3MO session locked")
                if (!device || device.type !== DEVICE_TYPE.LOCAL_MNEMONIC) {
                    throw new Error("Linked wallet must be local mnemonic")
                }
                if (!account) throw new Error("Linked account not found")

                const network = pickNetwork(params.network, networks, customNetworks)
                const thor = ThorClient.at(network.url)

                const wallet = await decryptWalletWithKey((device as LocalDevice).wallet, walletKey)
                const privateKey = derivePrivateKey(wallet, account.index)

                const clauses = params.clauses.map(c => ({
                    to: c.to,
                    value: c.value || "0x0",
                    data: c.data || "0x",
                }))

                const gasResult =
                    params.gasHint && params.gasHint > 0
                        ? { gas: params.gasHint }
                        : await thor.transactions.estimateGas(clauses, linkedAddress)
                const gas = "gas" in gasResult ? gasResult.gas : params.gasHint ?? 0
                if (!gas) throw new Error("Could not estimate gas")

                const head = await thor.blocks.getBestBlockCompressed()
                if (!head) throw new Error("Could not fetch best block")

                const transaction = Transaction.of({
                    chainTag: parseInt(network.genesisId.slice(-2), 16),
                    blockRef: head.id.slice(0, 18),
                    expiration: 100,
                    clauses,
                    gas,
                    gasPriceCoef: 0,
                    dependsOn: null,
                    nonce: HexUtils.generateRandom(8),
                })

                const hash = transaction.getTransactionHash().bytes
                const signature = Secp256k1.sign(hash, new Uint8Array(privateKey))
                const signedTx = Transaction.of(transaction.body, Buffer.from(signature))

                const encoded = HexUtils.addPrefix(Buffer.from(signedTx.encoded).toString("hex"))
                const broadcast = await axios.post<{ id: string }>(`${network.url}/transactions`, { raw: encoded })
                const txId = broadcast.data.id

                if (jwt) {
                    await axios.post(
                        `${B3MO_BACKEND_URL}/chat/exec-result`,
                        {
                            sessionId: params.sessionId,
                            toolCallId: params.toolCallId,
                            success: true,
                            txId,
                        },
                        { headers: { Authorization: `Bearer ${jwt}` } },
                    )
                }

                return { success: true, txId }
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e)
                if (jwt) {
                    try {
                        await axios.post(
                            `${B3MO_BACKEND_URL}/chat/exec-result`,
                            {
                                sessionId: params.sessionId,
                                toolCallId: params.toolCallId,
                                success: false,
                                error: message,
                            },
                            { headers: { Authorization: `Bearer ${jwt}` } },
                        )
                    } catch {
                        // best-effort: ignore secondary failure reporting an error
                    }
                }
                return { success: false, error: message }
            }
        },
        [linkedAddress, walletKey, account, device, networks, customNetworks, jwt],
    )

    return { execute, ownerAddress: linkedAddress ? Address.of(linkedAddress).toString() : undefined }
}

type ResolvedNetwork = { url: string; genesisId: string }

function pickNetwork(
    target: "mainnet" | "testnet",
    networks: ReturnType<typeof selectNetworks>,
    customNetworks: ReturnType<typeof selectCustomNetworks>,
): ResolvedNetwork {
    const all = [...networks, ...customNetworks]
    const wanted = target === "mainnet" ? NETWORK_TYPE.MAIN : NETWORK_TYPE.TEST
    const match = all.find(n => n.type === wanted) ?? all.find(n => n.id === wanted)
    if (!match) throw new Error(`No ${target} network configured`)
    return { url: match.currentUrl, genesisId: match.genesis.id }
}
