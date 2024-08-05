import { useThor } from "~Components"
import { useCallback, useEffect, useMemo } from "react"
import {
    addDomainName,
    setVnsNames,
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
        const vnsName = nameRes ?? name

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
        queryKey: [name, address, network],
        queryFn: () => fetchVns(),
        enabled: !isQueryDisabled,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    })

    const vnsData = useMemo(() => queryRes?.data, [queryRes.data])

    return {
        name: vnsData?.name || name || "",
        address: vnsData?.address || address || "",
        isLoading: queryRes?.isLoading,
        getVnsName: addr => getVnsName(thor, network.type, addr),
        getVnsAddress: n => getVnsAddresse(thor, network.type, n),
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
    const dispatch = useAppDispatch()

    const fetchData = useCallback(
        async (address: string) => {
            const vnsName = await getVnsName(thor, network.type, address)
            // eslint-disable-next-line no-console
            console.log("FETCH VNS", vnsName)
            return { name: vnsName, address: address }
        },
        [thor, network.type],
    )

    const isQueryDisabled = useMemo(() => {
        const onWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        return onWrongNetwork
    }, [network.type])

    const vnsResults = useQueries({
        queries: accounts.map(acc => ({
            queryKey: ["vns_names", network, acc.address],
            queryFn: () => fetchData(acc.address),
            enabled: !isQueryDisabled,
            staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
        })),
    })

    useEffect(() => {
        if (vnsResults) {
            let resultsWithNames = []
            for (const result of vnsResults) {
                if (result.data) {
                    resultsWithNames.push(result.data)
                }
            }

            dispatch(setVnsNames(resultsWithNames))
        }
    }, [accounts.length, dispatch, vnsResults])

    return vnsResults
}

export const useFetchContactsVns = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const contacts = useAppSelector(selectContacts)
    const dispatch = useAppDispatch()

    const fetchContactsVns = useCallback(
        async (address: string) => {
            const name = await getVnsName(thor, network.type, address)
            return { domain: name, address }
        },
        [thor, network.type],
    )

    const isQueryDisabled = useMemo(() => {
        const onWrongNetwork = network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER
        return onWrongNetwork
    }, [network.type])

    const contactVnsResults = useQueries({
        queries: contacts.map(contact => ({
            queryKey: ["contact_vns_name", network, contact.address],
            queryFn: () => fetchContactsVns(contact.address),
            enabled: !isQueryDisabled,
            staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds,
        })),
    })

    useEffect(() => {
        if (contactVnsResults) {
            let contactWithNames = []
            for (const result of contactVnsResults) {
                if (result.data) {
                    contactWithNames.push(result.data)
                }
            }

            dispatch(addDomainName(contactWithNames))
        }
    }, [contactVnsResults, dispatch])

    return contactVnsResults
}
