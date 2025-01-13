import { showErrorToast, useThor, WalletEncryptionKeyHelper } from "~Components"
import { useCallback, useMemo } from "react"
import {
    selectAccounts,
    selectContacts,
    selectDevice,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { QueryObserverResult, RefetchOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { AccountWithDevice, LocalDevice, Network, NETWORK_TYPE } from "~Model"
import { abi } from "thor-devkit"
import { queryClient } from "~Api/QueryProvider"
import {
    abis,
    DOMAIN_BASE,
    DEFAULT_DELEGATOR_URL,
    TESTNET_VNS_PUBLIC_RESOLVER,
    TESTNET_VNS_REGISTRAR_CONTRACT,
    TESTNET_VNS_SUBDOMAIN_CONTRACT,
    AnalyticsEvent,
} from "~Constants"
import { HDKey, Hex, HexUInt, Secp256k1, Transaction, TransactionBody } from "@vechain/sdk-core"
import {
    ProviderInternalBaseWallet,
    signerUtils,
    ThorClient,
    VeChainProvider,
    VeChainSigner,
    vnsUtils,
} from "@vechain/sdk-network"
import { error } from "~Utils"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const VNS_RESOLVER: Partial<{ [key in NETWORK_TYPE]: string }> = {
    mainnet: "0xA11413086e163e41901bb81fdc5617c975Fa5a1A",
    testnet: "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94",
} as const

type SubdomainClaimTransaction = TransactionBody & {
    simulateTransactionOptions: { caller: string }
}

export const getVnsName = async (thor: Connex.Thor, network: Network, address?: string) => {
    if (!address) return ""
    const NETWORK_RESOLVER = VNS_RESOLVER[network.type]

    try {
        const {
            decoded: { names },
        } = await thor
            .account(NETWORK_RESOLVER ?? "")
            .method(abis.VetDomains.getNames)
            .call([address])

        // Add VNS to the react-query cache
        queryClient.setQueryData([names?.[0], address, network.genesis.id], { name: names?.[0], address })

        return names?.[0] || ""
    } catch {
        return ""
    }
}

export const getVnsAddress = async (thor: Connex.Thor, network: Network, name?: string) => {
    const NETWORK_RESOLVER = VNS_RESOLVER[network.type]
    const {
        decoded: { addresses },
    } = await thor
        .account(NETWORK_RESOLVER ?? "")
        .method(abis.VetDomains.getAddresses)
        .call([(name ?? "").toLowerCase()])
    const isEmpty = addresses?.[0] === ZERO_ADDRESS

    if (!isEmpty) {
        // Add VNS to the react-query cache if address is not empty
        queryClient.setQueryData([name, addresses?.[0], network.genesis.id], { name, address: addresses?.[0] })
    }

    return isEmpty ? undefined : addresses?.[0] || undefined
}

const namesABi = new abi.Function(abis.VetDomains.getNames)

const getAllAccoutsNameClauses = (addresses: string[], networkType: NETWORK_TYPE) => {
    const NETWORK_RESOLVER = VNS_RESOLVER[networkType]
    const clauses: Connex.VM.Clause[] = addresses.map(addr => {
        return {
            to: NETWORK_RESOLVER ?? "",
            value: 0,
            data: namesABi.encode([addr]),
        }
    })

    return clauses
}

export const getAllVns = async (
    thor: Connex.Thor,
    network: Network,
    accounts: AccountWithDevice[],
    addresses: string[],
) => {
    const clauses = getAllAccoutsNameClauses(addresses, network.type)

    const responses = await thor.explain(clauses).execute()

    const states = responses.map((response, idx) => {
        const decoded = namesABi.decode(response.data)
        const address = accounts[idx]?.address ?? ""
        const vnsName = decoded.names[0]
        const state = { name: vnsName, address: address }

        queryClient.setQueryData([vnsName, address, network.genesis.id], state)

        return state
    })
    return states
}

export type Vns = {
    name?: string
    address?: string
}

type VnsHook = {
    name: string
    address: string
    isLoading: boolean
    getVnsName: (address: string) => Promise<string | undefined>
    getVnsAddress: (name: string) => Promise<string | undefined>
    refetchVns: (options?: RefetchOptions) => Promise<QueryObserverResult<Vns, Error>>
    /**
     * Get all the VNS name/addresses
     */
    getVns: () => Vns[] | undefined
    isSubdomainAvailable: (domainName: string) => Promise<boolean>
    registerSubdomain: (domainName: string, pin?: string) => Promise<boolean>
}

export const useVns = (props?: Vns): VnsHook => {
    const thor = useThor()
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const device = useAppSelector(state => selectDevice(state, account.rootAddress))
    const qc = useQueryClient()
    const trackEvent = useAnalyticTracking()
    const { name, address = account.address } = props || {}

    const thorClient = useMemo(() => ThorClient.at(network.currentUrl), [network.currentUrl])

    const fetchVns = useCallback(async () => {
        const nameRes = await getVnsName(thor, network, address)
        const vnsName = nameRes || name

        const addrRes = await getVnsAddress(thor, network, vnsName)
        const vnsAddr = addrRes || address

        return { name: vnsName, address: vnsAddr }
    }, [address, name, network, thor])

    const isQueryDisabled = useMemo(() => {
        const isOnWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        const isMissingData = !address && !name
        return isOnWrongNetwork || isMissingData
    }, [address, name, network.type])

    const queryRes = useQuery<Vns>({
        queryKey: [name, address, network.genesis.id],
        queryFn: () => fetchVns(),
        enabled: !isQueryDisabled,
        staleTime: 1000 * 60,
    })

    const isSubdomainAvailable = useCallback(
        async (domainName: string) => {
            if (domainName.includes(DOMAIN_BASE)) {
                try {
                    const res = await vnsUtils.resolveName(thorClient, domainName)
                    if (res) throw new Error("Subdomain is not available")
                    else return true
                } catch (e) {
                    error("APP", e)
                    return false
                }
            } else return false
        },
        [thorClient],
    )

    const getVns = useCallback(() => {
        return qc.getQueryData<Vns[]>(["vns_names", network.genesis.id])
    }, [network.genesis.id, qc])

    //#region  Subdomain registration
    const getSigner = useCallback(
        async (_device: LocalDevice, password?: string) => {
            const wallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: _device.wallet,
                pinCode: password,
            })

            if (!wallet.mnemonic && !wallet.privateKey)
                throw new Error("Either mnemonic or privateKey must be provided")

            try {
                let privateKey: Uint8Array<ArrayBufferLike> = !wallet.mnemonic
                    ? Hex.of(wallet.privateKey!).bytes
                    : new Uint8Array()

                if (wallet.mnemonic) {
                    const derivedPrivateKey = HDKey.fromMnemonic(wallet.mnemonic).deriveChild(account.index).privateKey

                    if (!derivedPrivateKey) throw new Error("No private key found")

                    privateKey = Hex.of(derivedPrivateKey).bytes
                }

                const isValidPrivateKey = Secp256k1.isValidPrivateKey(privateKey)

                if (!isValidPrivateKey) throw new Error("Invalid private key")

                const provider = new VeChainProvider(
                    thorClient,
                    new ProviderInternalBaseWallet([{ privateKey, address: account.address }], {
                        delegator: { delegatorUrl: DEFAULT_DELEGATOR_URL },
                    }),
                    true,
                )
                return await provider.getSigner()
            } catch (e) {
                throw new Error((e as Error)?.message)
            }
        },
        [account, thorClient],
    )

    const getTotalGas = useCallback(
        async (transaction: SubdomainClaimTransaction) => {
            try {
                const gasResult = await thorClient.gas.estimateGas(transaction.clauses, address)

                const { totalGas, reverted, vmErrors, revertReasons } = gasResult

                if (!gasResult || reverted || vmErrors?.length || revertReasons?.length) {
                    const reason = (revertReasons || vmErrors)?.toString()
                    throw new Error(`Gas error: ${reason}`)
                } else return totalGas
            } catch (e) {
                throw new Error((e as Error)?.message)
            }
        },
        [address, thorClient.gas],
    )

    const buildClaimTx = useCallback(
        async (subdomain: string) => {
            try {
                const dataClaimer = new abi.Function(abis.VetDomains.claim).encode(
                    subdomain,
                    TESTNET_VNS_PUBLIC_RESOLVER,
                )

                const fulldomain = `${subdomain}${DOMAIN_BASE}`

                const dataRegistrar = new abi.Function(abis.VetDomains.setName).encode(fulldomain)

                const clauses = [
                    {
                        data: dataClaimer,
                        to: TESTNET_VNS_SUBDOMAIN_CONTRACT,
                        value: "0x0",
                    },
                    {
                        data: dataRegistrar,
                        to: TESTNET_VNS_REGISTRAR_CONTRACT,
                        value: "0x0",
                    },
                ]

                const gas = await thorClient.gas.estimateGas(clauses, account.address)
                const blockRef = await thorClient.blocks.getBestBlockRef()
                if (!blockRef) throw new Error("Failed to get block ref")

                const transaction: SubdomainClaimTransaction = {
                    clauses,
                    gas: gas.totalGas,
                    nonce: 1,
                    blockRef,
                    expiration: 0,
                    chainTag: parseInt(network.genesis.id.slice(-2), 16),
                    dependsOn: null,
                    gasPriceCoef: 0,
                    reserved: { features: 1 },
                    simulateTransactionOptions: {
                        caller: account.address,
                    },
                }

                const totalGas = await getTotalGas(transaction)
                if (!totalGas) throw new Error("No gas")
                const bufferedGas = totalGas + totalGas * 0.2

                // 4 - Build transaction body
                return await thorClient.transactions.buildTransactionBody(
                    transaction.clauses,
                    parseInt(bufferedGas.toFixed(0), 10),
                    {
                        isDelegated: true,
                    },
                )
            } catch (e) {
                throw new Error((e as Error)?.message)
            }
        },
        [account.address, getTotalGas, network.genesis.id, thorClient],
    )

    const signClaimTx = useCallback(
        async (signer: VeChainSigner, txBody: TransactionBody) => {
            try {
                const rawDelegateSigned =
                    (await signer?.signTransaction(
                        signerUtils.transactionBodyToTransactionRequestInput(txBody, account.address),
                    )) || ""

                const delegatedSignedTx = Transaction.decode(HexUInt.of(rawDelegateSigned.slice(2)).bytes, true)

                // 5 - Send the transaction
                const sendTransactionResult = await thorClient.transactions.sendTransaction(delegatedSignedTx)

                // 6 - Wait for transaction receipt
                const txReceipt = await thorClient.transactions.waitForTransaction(sendTransactionResult.id)

                if (txReceipt?.reverted) {
                    // Get the revert reason
                    const revertReason = await thorClient.transactions.getRevertReason(sendTransactionResult.id)
                    throw new Error(revertReason ?? "Error claiming subdomain")
                }
            } catch (e) {
                throw new Error((e as Error)?.message)
            }
        },
        [account.address, thorClient.transactions],
    )
    //#endregion

    const registerSubdomain = useCallback(
        async (domainName: string, password?: string) => {
            if (!device) return false
            try {
                if (!("wallet" in device)) throw new Error("Ledger device not supported")
                const signer = await getSigner(device, password)

                if (!signer) throw new Error("No signer")

                const txBody = await buildClaimTx(domainName)
                await signClaimTx(signer, txBody)

                return true
            } catch (e) {
                const err = e as Error
                const errMessage: string = err?.message
                error("APP", errMessage)
                const isSubdomainAlreadyClaimed = errMessage.includes("already claimed")
                const noGasLeft = errMessage.includes("HTTP 403")
                if (noGasLeft) {
                    trackEvent(AnalyticsEvent.CLAIM_USERNAME_FAILED, {
                        reason: "no-gas-left",
                        domainName,
                    })
                    showErrorToast({
                        text1: LL.NOTIFICATION_failed_no_gas(),
                    })
                } else if (isSubdomainAlreadyClaimed) {
                    trackEvent(AnalyticsEvent.CLAIM_USERNAME_FAILED, {
                        reason: "already-claimed",
                        domainName,
                    })
                    showErrorToast({
                        text1: LL.NOTIFICATION_failed_subdomain_already(),
                    })
                } else {
                    trackEvent(AnalyticsEvent.CLAIM_USERNAME_FAILED, {
                        reason: "generic",
                        domainName,
                    })
                    showErrorToast({
                        text1: LL.NOTIFICATION_failed_subdomain(),
                    })
                }
                return false
            }
        },
        [LL, buildClaimTx, device, getSigner, signClaimTx, trackEvent],
    )

    return {
        name: queryRes.data?.name || name || "",
        address: queryRes.data?.address || address || "",
        isLoading: queryRes?.isLoading,
        getVnsName: addr => getVnsName(thor, network, addr),
        getVnsAddress: n => getVnsAddress(thor, network, n),
        refetchVns: queryRes?.refetch,
        getVns,
        registerSubdomain,
        isSubdomainAvailable,
    }
}

export const usePrefetchAllVns = async () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectContacts)

    const isQueryDisabled = useMemo(() => {
        const isOnWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        return isOnWrongNetwork || !thor
    }, [network.type, thor])

    const addresses = useMemo(
        () => [...accounts.map(acc => acc.address), ...contacts.map(ctc => ctc.address)],
        [accounts, contacts],
    )

    const vnsResults = useQuery({
        queryKey: ["vns_names", network.genesis.id],
        queryFn: () => getAllVns(thor, network, accounts, addresses),
        enabled: !isQueryDisabled,
        staleTime: 1000 * 60,
    })

    return vnsResults
}
