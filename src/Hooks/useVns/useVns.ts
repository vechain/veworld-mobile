import { showErrorToast, useThor, WalletEncryptionKeyHelper } from "~Components"
import { useCallback, useMemo } from "react"
import { selectAccounts, selectContacts, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { QueryObserverResult, RefetchOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { AccountWithDevice, DEVICE_TYPE, LocalDevice, Network, NETWORK_TYPE } from "~Model"
import { abi } from "thor-devkit"
import { queryClient } from "~Api/QueryProvider"
import {
    abis,
    DOMAIN_BASE,
    DELEGATOR_URL,
    AnalyticsEvent,
    VNS_PUBLIC_RESOLVER,
    VNS_SUBDOMAIN_CONTRACT,
    VNS_REGISTRAR_CONTRACT,
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
import { AccountUtils, AddressUtils, error } from "~Utils"
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

export const getVnsNames = async (thor: Connex.Thor, network: Network, addresses?: string[]) => {
    if (!addresses) return []
    const NETWORK_RESOLVER = VNS_RESOLVER[network.type]

    try {
        const {
            decoded: { names },
        } = await thor
            .account(NETWORK_RESOLVER ?? "")
            .method(abis.VetDomains.getNames)
            .call(addresses)

        const states = (names as string[]).map((name, idx) => {
            const address = addresses[idx] ?? ""
            const state = { name, address: address }

            queryClient.setQueryData(["vns_name", name, address, network.genesis.id], state)

            return state
        })

        return states
    } catch {
        return []
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
        queryClient.setQueryData(["vns_name", name, addresses?.[0], network.genesis.id], {
            name,
            address: addresses?.[0],
        })
    }

    return isEmpty ? undefined : addresses?.[0] || undefined
}

export type Vns = {
    name?: string
    address?: string
}

type VnsHook = {
    name: string
    address: string
    isLoading: boolean
    hasDomain: boolean
    getVnsName: (address: string) => Promise<Vns[]>
    getVnsAddress: (name: string) => Promise<string | undefined>
    refetchVns: (options?: RefetchOptions) => Promise<QueryObserverResult<Vns, Error>>
    isSubdomainAvailable: (domainName: string) => Promise<boolean>
    registerSubdomain: (account: AccountWithDevice, domainName: string, pin?: string) => Promise<boolean>
    resetVns: () => Promise<void>
}

export const useVns = (props?: Vns): VnsHook => {
    const thor = useThor()
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const trackEvent = useAnalyticTracking()
    const qc = useQueryClient()
    const { name, address } = props || {}

    const thorClient = useMemo(() => ThorClient.at(network.currentUrl), [network.currentUrl])

    const fetchVns = useCallback(async () => {
        const _address = address ? [address] : undefined
        const nameRes = await getVnsNames(thor, network, _address)
        const vnsName = nameRes[0]?.name || name

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
        queryKey: ["vns_name", name, address, network.genesis.id],
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

    //#region  Subdomain registration
    const getSigner = useCallback(
        async (device: LocalDevice, account: AccountWithDevice, password?: string) => {
            const wallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: device.wallet,
                pinCode: password,
            })

            if (!wallet.mnemonic && !wallet.privateKey)
                throw new Error("Either mnemonic or privateKey must be provided")

            try {
                let privateKey: Uint8Array = !wallet.mnemonic ? Hex.of(wallet.privateKey!).bytes : new Uint8Array()

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
                        delegator: { delegatorUrl: DELEGATOR_URL[network.type] },
                    }),
                    true,
                )
                return await provider.getSigner()
            } catch (e) {
                throw new Error((e as Error)?.message)
            }
        },
        [network.type, thorClient],
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
        async (account: AccountWithDevice, subdomain: string) => {
            try {
                const dataClaimer = new abi.Function(abis.VetDomains.claim).encode(
                    subdomain,
                    VNS_PUBLIC_RESOLVER[network.type],
                )

                const fulldomain = `${subdomain}${DOMAIN_BASE}`

                const dataRegistrar = new abi.Function(abis.VetDomains.setName).encode(fulldomain)

                const clauses = [
                    {
                        data: dataClaimer,
                        to: VNS_SUBDOMAIN_CONTRACT[network.type],
                        value: "0x0",
                    },
                    {
                        data: dataRegistrar,
                        to: VNS_REGISTRAR_CONTRACT[network.type],
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
        [getTotalGas, network.genesis.id, network.type, thorClient.blocks, thorClient.gas, thorClient.transactions],
    )

    const signClaimTx = useCallback(
        async (signer: VeChainSigner, accountAddress: string, txBody: TransactionBody) => {
            try {
                const rawDelegateSigned =
                    (await signer?.signTransaction(
                        signerUtils.transactionBodyToTransactionRequestInput(txBody, accountAddress),
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
        [thorClient.transactions],
    )
    //#endregion

    const registerSubdomain = useCallback(
        async (account: AccountWithDevice, domainName: string, password?: string) => {
            const device = account.device
            try {
                if (!("wallet" in device)) throw new Error("Ledger device not supported")
                const signer = await getSigner(device, account, password)

                if (!signer) throw new Error("No signer")

                const txBody = await buildClaimTx(account, domainName)
                await signClaimTx(signer, account.address, txBody)

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
        [LL, buildClaimTx, getSigner, signClaimTx, trackEvent],
    )

    const domain = useMemo(() => queryRes.data?.name || name || "", [name, queryRes])
    const hasDomain = useMemo(() => Boolean(domain), [domain])

    const resetVns = useCallback(async () => {
        await qc.invalidateQueries({ queryKey: ["vns_name"] })
        await qc.invalidateQueries({
            queryKey: ["vns_names", network.genesis.id],
            refetchType: "all",
        })
    }, [network.genesis.id, qc])

    return {
        name: queryRes.data?.name || name || "",
        address: queryRes.data?.address || address || "",
        hasDomain,
        isLoading: queryRes?.isLoading,
        getVnsName: addr => getVnsNames(thor, network, [addr]),
        getVnsAddress: n => getVnsAddress(thor, network, n),
        refetchVns: queryRes?.refetch,
        registerSubdomain,
        isSubdomainAvailable,
        resetVns,
    }
}

export const usePrefetchAllVns = () => {
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
        queryFn: () => getVnsNames(thor, network, addresses),
        enabled: !isQueryDisabled,
        staleTime: 0,
    })

    return vnsResults
}

export const useClaimableUsernames = () => {
    const contacts = useAppSelector(selectContacts)
    const accounts = useAppSelector(selectAccounts)
    const { data: cachedAddresses } = usePrefetchAllVns()

    const observed = accounts.filter(account => AccountUtils.isObservedAccount(account))

    const contactAddresses = useMemo(() => new Set(contacts.map(c => c.address)), [contacts])
    const observedAddresses = useMemo(() => new Set(observed.map(o => o.address)), [observed])
    const accountAddresses = useMemo(() => new Set(accounts.map(a => a.address)), [accounts])

    const unclaimedAddresses = useMemo(() => {
        if (!cachedAddresses) return []
        return cachedAddresses.filter(cachedAddr => {
            const address = cachedAddr.address
            if (!address) return false
            if (cachedAddr.name) return false
            if (!accountAddresses.has(address)) return false
            if (contactAddresses.has(address)) return false
            if (observedAddresses.has(address)) return false
            return true
        })
    }, [accountAddresses, cachedAddresses, contactAddresses, observedAddresses])

    return { unclaimedAddresses }
}

export const getClaimableUsernames = (
    domains: Vns[] | undefined,
    deviceAccounts: AccountWithDevice[],
): Promise<string[]> => {
    if (!domains || domains.length === 0) {
        const res = deviceAccounts.reduce((acc: string[], account) => {
            const isLedger = "device" in account && account.device.type === DEVICE_TYPE.LEDGER
            const isObservedAccount = AccountUtils.isObservedAccount(account)
            const canClaimUsername = !isObservedAccount && !isLedger

            if (canClaimUsername) {
                acc.push(account.address)
            }

            return acc
        }, [])
        return Promise.resolve(res)
    }
    const noVnsAccounts = deviceAccounts.reduce((acc: string[], account) => {
        const isLedger = "device" in account && account.device.type === DEVICE_TYPE.LEDGER
        const isObservedAccount = AccountUtils.isObservedAccount(account)
        const domain = domains.find(vns => AddressUtils.compareAddresses(vns.address, account.address))?.name
        const canClaimUsername = !isObservedAccount && !domain && !isLedger

        if (canClaimUsername) {
            acc.push(account.address)
        }

        return acc
    }, [])
    return Promise.resolve(noVnsAccounts)
}
