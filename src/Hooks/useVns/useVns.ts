import { useThor } from "~Components"
import { useCallback, useMemo } from "react"
import { selectAccounts, selectContacts, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { NETWORK_TYPE } from "~Model"
import { abi } from "thor-devkit"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const VNS_RESOLVER: Partial<{ [key in NETWORK_TYPE]: string }> = {
    mainnet: "0xA11413086e163e41901bb81fdc5617c975Fa5a1A",
    testnet: "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94",
} as const

export const getVnsName = async (thor: Connex.Thor, networkType: NETWORK_TYPE, address?: string) => {
    if (!address) return ""
    const NETWORK_RESOLVER = VNS_RESOLVER[networkType]

    try {
        const {
            decoded: { names },
        } = await thor
            .account(NETWORK_RESOLVER ?? "")
            .method(ABI.getNames)
            .call([address])

        return names?.[0] || ""
    } catch {
        return ""
    }
}

export const getVnsAddresse = async (thor: Connex.Thor, networkType: NETWORK_TYPE, name?: string) => {
    const NETWORK_RESOLVER = VNS_RESOLVER[networkType]
    const {
        decoded: { addresses },
    } = await thor
        .account(NETWORK_RESOLVER ?? "")
        .method(ABI.getAddresses)
        .call([(name ?? "").toLowerCase()])
    const isEmpty = addresses?.[0] === ZERO_ADDRESS
    return isEmpty ? undefined : addresses?.[0] || undefined
}

export type Vns = {
    name?: string
    address?: string
}

export type VnsHook = {
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
        const nameRes = await getVnsName(thor, network.type, address)
        const vnsName = nameRes || name

        const addrRes = await getVnsAddresse(thor, network.type, vnsName)
        const vnsAddr = addrRes || address

        return { name: vnsName, address: vnsAddr }
    }, [address, name, network.type, thor])

    const isQueryDisabled = useMemo(() => {
        const onWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        const missingData = !address && !name
        return onWrongNetwork || missingData
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
        getVnsName: addr => getVnsName(thor, network.type, addr),
        getVnsAddress: n => getVnsAddresse(thor, network.type, n),
    }
}

const ABI: {
    getAddresses: abi.Function.Definition
    getNames: abi.Function.Definition
} = {
    getAddresses: {
        inputs: [
            {
                internalType: "string[]",
                name: "names",
                type: "string[]",
            },
        ],
        name: "getAddresses",
        outputs: [
            {
                internalType: "address[]",
                name: "addresses",
                type: "address[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    getNames: {
        inputs: [
            {
                internalType: "address[]",
                name: "addresses",
                type: "address[]",
            },
        ],
        name: "getNames",
        outputs: [
            {
                internalType: "string[]",
                name: "names",
                type: "string[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
}

const namesABi = new abi.Function(ABI.getNames)

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
    const queryClient = useQueryClient()

    const isQueryDisabled = useMemo(() => {
        const onWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        return onWrongNetwork || !thor
    }, [network.type, thor])

    const addresses = useMemo(
        () => [...accounts.map(acc => acc.address), ...contacts.map(ctc => ctc.address)],
        [accounts, contacts],
    )

    const vnsResults = useQuery({
        queryKey: ["vns_names", network.genesis.id],
        queryFn: async () => {
            const clauses = getAllAccoutsNameClauses(addresses, network.type)

            const res = await thor.explain(clauses).execute()

            const states = res.map((r, idx) => {
                const decoded = namesABi.decode(r.data)
                const address = accounts[idx].address
                const vnsName = decoded.names[0]
                const state = { name: vnsName, address }

                queryClient.setQueryData([vnsName, address, network.genesis.id], state)

                return state
            })
            return states
        },
        enabled: !isQueryDisabled,
        staleTime: 1000 * 60,
    })

    return vnsResults
}
