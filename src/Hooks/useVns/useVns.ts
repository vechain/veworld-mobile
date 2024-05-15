import { useThor } from "~Components"
import { useCallback, useEffect, useMemo, useState } from "react"
import { addVnsName, selectAccounts, selectSelectedNetwork, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useQueries } from "@tanstack/react-query"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const VNS_RESOLVER = {
    mainnet: "0xA11413086e163e41901bb81fdc5617c975Fa5a1A",
    testnet: "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94",
} as const

export const useVns = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const [stateName, setName] = useState("")
    const [stateAddress, setAddres] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const NETWORK_RESOLVER = useMemo(() => {
        return VNS_RESOLVER[network.type as keyof typeof VNS_RESOLVER]
    }, [network.type])

    const _getAddress = useCallback(
        async (_name: string) => {
            setIsLoading(true)
            const {
                decoded: { addresses },
            } = await thor.account(NETWORK_RESOLVER).method(ABI.getAddresses).call([_name.toLowerCase()])

            setIsLoading(false)

            if (Array.isArray(addresses)) {
                setAddres(addresses[0])
                return addresses[0]
            }

            setAddres(addresses)
            return addresses[0]
        },
        [NETWORK_RESOLVER, thor],
    )

    const _getName = useCallback(
        async (_address: string) => {
            setIsLoading(true)

            const {
                decoded: { names },
            } = await thor.account(NETWORK_RESOLVER).method(ABI.getNames).call([_address])

            setIsLoading(false)

            if (Array.isArray(names)) {
                setName(names[0])
                setAddres(_address)
                return { name: names[0], address: _address }
            }

            setName(names)
            setAddres(_address)
            return { name: names[0], address: _address }
        },
        [NETWORK_RESOLVER, thor],
    )

    return { name: stateName, address: stateAddress, _getName, _getAddress, isLoading }
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
        return VNS_RESOLVER[network.type as keyof typeof VNS_RESOLVER]
    }, [network.type])

    const fetchData = useCallback(
        async (address: string) => {
            const {
                decoded: { names },
            } = await thor.account(NETWORK_RESOLVER).method(ABI.getNames).call([address])

            return { name: names[0], address: address }
        },
        [thor, NETWORK_RESOLVER],
    )

    const vnsResults = useQueries({
        queries: accounts.map(acc => ({
            queryKey: ["vns_name", acc.address],
            queryFn: () => fetchData(acc.address),
            enabled: true,
            staleTime: Infinity,
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
