import { useThor } from "~Components"
import { useCallback, useEffect, useMemo, useState } from "react"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { NETWORK_TYPE } from "~Model"

const VNS_RESOLVER = {
    mainnet: "0xA11413086e163e41901bb81fdc5617c975Fa5a1A",
    testnet: "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94",
} as const

export const useVns = ({ name, address }: { name?: string; address?: string }) => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const [stateName, setName] = useState("")
    const [stateAddress, setAddres] = useState("")

    const NETWORK_RESOLVER = useMemo(() => {
        return VNS_RESOLVER[network.type as keyof typeof VNS_RESOLVER]
    }, [network.type])

    const _getAddress = useCallback(
        async (_name: string) => {
            const {
                decoded: { addresses },
            } = await thor.account(NETWORK_RESOLVER).method(ABI.getAddresses).call([_name])

            if (Array.isArray(addresses)) {
                setAddres(addresses[0])
                return
            }

            setAddres(addresses)
        },
        [NETWORK_RESOLVER, thor],
    )

    const _getName = useCallback(
        async (_address: string) => {
            const {
                decoded: { names },
            } = await thor.account(NETWORK_RESOLVER).method(ABI.getNames).call([_address])

            if (Array.isArray(names)) {
                setName(names[0])
                setAddres(_address)
                return
            }

            setName(names)
            setAddres(_address)
        },
        [NETWORK_RESOLVER, thor],
    )

    useEffect(() => {
        if (network.type === NETWORK_TYPE.SOLO || network.type === NETWORK_TYPE.OTHER) return

        if (!name && !address) {
            throw new Error("At least one of 'name' or 'address' must be provided.")
        }

        if (name && !address) {
            _getAddress(name)
        } else if (!name && address) {
            _getName(address)
        } else if (name && address) {
            _getAddress(name)
            _getName(address)
        }
    }, [address, _getAddress, _getName, name, network.type])

    return { name: stateName, address: stateAddress }
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
