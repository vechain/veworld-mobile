import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { VeBetterDao } from "~Constants/Constants/Thor/abis"
import { useThorClient } from "~Hooks/useThorClient"
import { selectSelectedAccountOrNull, selectSelectedNetwork } from "~Storage/Redux"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { Network } from "~Model"
import {
    VEBETTER_DAO_NAVIGATOR_REGISTRY_MAINNET_CONTRACT,
    VEBETTER_DAO_NAVIGATOR_REGISTRY_TESTNET_CONTRACT,
} from "~Constants"

const getUserHasNavigator = async (address: string, thorClient: ThorClient, network: Network) => {
    return await thorClient.contracts
        .load(
            network.type === "mainnet"
                ? VEBETTER_DAO_NAVIGATOR_REGISTRY_MAINNET_CONTRACT
                : VEBETTER_DAO_NAVIGATOR_REGISTRY_TESTNET_CONTRACT,
            [VeBetterDao.Navigator.isDelegated],
        )
        .read.isDelegated(address)
}

export const getUserHasNavigatorQueryKey = (address: string, network: Network) => [
    "VEBETTERDAO",
    "USER",
    "HAS_NAVIGATOR",
    address,
    network.genesis.id,
]

/**
 * Checks if the user has delegated to a navigator
 * @returns {boolean} true if the user has delegated to a navigator, false otherwise
 */
export const useUserHasNavigator = () => {
    const thorClient = useThorClient()
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const network = useAppSelector(selectSelectedNetwork)

    return useQuery({
        queryKey: getUserHasNavigatorQueryKey(selectedAccount?.address ?? "", network),
        queryFn: () => getUserHasNavigator(selectedAccount?.address ?? "", thorClient, network),
        select: data => {
            return data?.[0] ?? false
        },
        enabled: !!selectedAccount?.address && !!thorClient,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
