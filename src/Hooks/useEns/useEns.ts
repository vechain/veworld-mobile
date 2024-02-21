import { useThor } from "~Components"
import { useCallback, useEffect, useState } from "react"
import { vendor } from "./MockVendor"
import { getAddress, getName } from "@vechain.energy/dapp-kit-hooks"

export const useEns = ({ name, address }: { name?: string; address?: string }) => {
    const thor = useThor()
    const [_name, setName] = useState("")
    const [_address, setAddres] = useState("")

    const _getAddress = useCallback(async () => {
        const connex: Connex = {
            thor: thor,
            vendor: vendor,
        }

        setAddres(await getAddress(_address, connex))
    }, [thor, _address])

    const _getName = useCallback(async () => {
        const connex: Connex = {
            thor: thor,
            vendor: vendor,
        }

        setName(await getName(_name, connex))
    }, [_name, thor])

    useEffect(() => {
        if (name && !address) {
            _getAddress()
        } else if (!name && address) {
            _getName()
        } else {
            _getAddress()
            _getName()
        }
    }, [address, _getAddress, _getName, name])

    return { name, address }
}
