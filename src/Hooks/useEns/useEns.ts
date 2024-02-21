import { useThor } from "~Components"
import { useCallback, useEffect, useState } from "react"

export const useEns = ({ name, address }: { name?: string; address?: string }) => {
    const thor = useThor()
    const [stateName, setName] = useState("")
    const [stateAddress, setAddres] = useState("")

    const _getAddress = useCallback(
        async (_name: string) => {
            const {
                decoded: { addresses },
            } = await thor.account(VET_RESOLVER_UTILS).method(ABI.getAddresses).call([_name])

            if (Array.isArray(addresses) && addresses[0]) {
                setAddres(addresses[0])
                return
            }

            setAddres(addresses[0])
        },
        [thor],
    )

    const _getName = useCallback(
        async (_address: string) => {
            const {
                decoded: { names },
            } = await thor.account(VET_RESOLVER_UTILS).method(ABI.getNames).call([_address])

            if (Array.isArray(names) && names[0]) {
                setName(names[0])
                return
            }

            setName(names[0])
        },
        [thor],
    )

    useEffect(() => {
        if (name && !address) {
            _getAddress(name)
        } else if (!name && address) {
            _getName(address)
        } else if (name && address) {
            _getAddress(name)
            _getName(address)
        }
    }, [address, _getAddress, _getName, name])

    return { name: stateName, address: stateAddress }
}

const VET_RESOLVER_UTILS = "0xA11413086e163e41901bb81fdc5617c975Fa5a1A"

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
