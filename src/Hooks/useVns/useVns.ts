import { useThor } from "~Components"
import { useCallback, useMemo } from "react"
import { selectAccounts, selectContacts, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Network, NETWORK_TYPE } from "~Model"
import { abi } from "thor-devkit"
import { queryClient } from "~Api/QueryProvider"
import { abis } from "~Constants"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const VNS_RESOLVER: Partial<{ [key in NETWORK_TYPE]: string }> = {
    mainnet: "0xA11413086e163e41901bb81fdc5617c975Fa5a1A",
    testnet: "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94",
} as const

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
}

export const useVns = (props?: Vns): VnsHook => {
    const { name, address } = props || {}
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)

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

    return {
        name: queryRes.data?.name || name || "",
        address: queryRes.data?.address || address || "",
        isLoading: queryRes?.isLoading,
        getVnsName: addr => getVnsName(thor, network, addr),
        getVnsAddress: n => getVnsAddress(thor, network, n),
    }
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

export const usePrefetchAllVns = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectContacts)
    const qc = useQueryClient()

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
        queryFn: async () => {
            const clauses = getAllAccoutsNameClauses(addresses, network.type)

            const responses = await thor.explain(clauses).execute()

            const states = responses.map((response, idx) => {
                const decoded = namesABi.decode(response.data)
                const address = accounts[idx].address
                const vnsName = decoded.names[0]
                const state = { name: vnsName, address }

                qc.setQueryData([vnsName, address, network.genesis.id], state)

                return state
            })
            return states
        },
        enabled: !isQueryDisabled,
        staleTime: 1000 * 60,
    })

    return vnsResults
}

// export const useAssignVnsToAddress = (domainName: string) => {}
