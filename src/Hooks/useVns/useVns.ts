import { useThor } from "~Components"
import { useCallback, useEffect, useMemo } from "react"
import {
    addDomainName,
    addVnsName,
    selectAccounts,
    selectContacts,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useQueries, useQuery } from "@tanstack/react-query"
import { NETWORK_TYPE } from "~Model"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const VNS_RESOLVER: Partial<{ [key in NETWORK_TYPE]: string }> = {
    mainnet: "0xA11413086e163e41901bb81fdc5617c975Fa5a1A",
    testnet: "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94",
} as const

export const getVnsNames = async (thor: Connex.Thor, networkType: NETWORK_TYPE, address?: string) => {
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

export const getVnsAddresses = async (thor: Connex.Thor, networkType: NETWORK_TYPE, name?: string) => {
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
    // validateVnsAddress: (
    //     name: string,
    //     onSuccess?: ValidateVnsAddressOnSuccess,
    // ) => Promise<string | boolean>
}

export const useVns = (props?: Vns): VnsHook => {
    const { name, address } = props || {}
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)

    const fetchVns = useCallback(async () => {
        const nameRes = await getVnsNames(thor, network.type, address)
        const addrRes = await getVnsAddresses(thor, network.type, nameRes)

        const vnsName = nameRes || name
        const vnsAddr = addrRes || address

        return { name: vnsName, address: vnsAddr }
    }, [address, name, network.type, thor])

    const isQueryDisabled = useMemo(() => {
        const onWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        const missingData = !address || !name
        return onWrongNetwork || missingData
    }, [address, name, network.type])

    const { data, isLoading } = useQuery<Vns>({
        queryKey: ["vns", name, address, network.type],
        queryFn: () => fetchVns(),
        enabled: !isQueryDisabled,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    })

    return {
        name: data?.name || name || "",
        address: data?.address || address || "",
        getVnsName: addr => getVnsNames(thor, network.type, addr),
        getVnsAddress: n => getVnsAddresses(thor, network.type, n),
        isLoading,
    }
}

const ABI = {
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

//
//
//
//
//
//
//

export const useFetchAllVns = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectAccounts)
    const disptatch = useAppDispatch()

    const NETWORK_RESOLVER = useMemo(() => {
        return VNS_RESOLVER[network.type]
    }, [network.type])

    const fetchData = useCallback(
        async (address: string) => {
            const {
                decoded: { names },
            } = await thor
                .account(NETWORK_RESOLVER ?? "")
                .method(ABI.getNames)
                .call([address])

            return { name: names[0], address: address }
        },
        [thor, NETWORK_RESOLVER],
    )

    const vnsResults = useQueries({
        queries: accounts.map(acc => ({
            queryKey: ["vns_name", acc.address],
            queryFn: () => fetchData(acc.address),
            enabled: true,
            staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds,
        })),
    })

    useEffect(() => {
        if (vnsResults) {
            let resultsWithNames = []
            for (const result of vnsResults) {
                if (result.data?.name) {
                    resultsWithNames.push(result.data)
                }
            }

            disptatch(addVnsName(resultsWithNames))
        }
    }, [disptatch, vnsResults])

    return vnsResults
}

export const useFetchContactsVns = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const contacts = useAppSelector(selectContacts)
    const disptatch = useAppDispatch()

    const fetchContactsVns = useCallback(
        async (address: string) => {
            const name = await getVnsNames(thor, network.type, address)
            return { domain: name, address }
        },
        [thor, network.type],
    )

    const contactVnsResults = useQueries({
        queries: contacts.map(contact => ({
            queryKey: ["contact_vns_name", contact.address],
            queryFn: () => fetchContactsVns(contact.address),
            enabled: true,
            // staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds,
            staleTime: 24, // 24 hours in milliseconds,
        })),
    })

    useEffect(() => {
        if (contactVnsResults) {
            let contactWithNames = []
            for (const result of contactVnsResults) {
                if (result.data?.domain) {
                    contactWithNames.push(result.data)
                }
            }

            disptatch(addDomainName(contactWithNames))
        }
    }, [contactVnsResults, disptatch])

    return contactVnsResults
}
