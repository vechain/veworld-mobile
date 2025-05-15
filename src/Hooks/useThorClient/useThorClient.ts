import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useThorClient = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const thorClient = useMemo(() => ThorClient.at(selectedNetwork.currentUrl), [selectedNetwork.currentUrl])
    return thorClient
}
