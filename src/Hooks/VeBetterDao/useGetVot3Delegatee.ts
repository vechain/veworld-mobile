import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { VeBetterDao } from "~Constants/Constants/Thor/abis"
import { useThorClient } from "~Hooks/useThorClient"
import { selectSelectedAccountOrNull, selectSelectedNetwork } from "~Storage/Redux"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { Network } from "~Model"
import { TEST_VOT3_ADDRESS, VOT3 } from "~Constants"

const getVot3Delegatee = async (address: string, thorClient: ThorClient, network: Network) => {
    return await thorClient.contracts
        .load(network.type === "mainnet" ? VOT3.address : TEST_VOT3_ADDRESS, [
            { ...VeBetterDao.Vot3Abis.delegates, stateMutability: "view" },
        ])
        .read.delegates(address)
}

export const getVot3DelegateeQueryKey = (address: string, network: Network) => [
    "VEBETTERDAO",
    "VOT3",
    "DELEGATEE",
    address,
    network.genesis.id,
]

/**
 * Reads the VOT3 (ERC20Votes) delegatee of the selected account. Returns the zero address
 * when the account has never delegated its voting power.
 */
export const useGetVot3Delegatee = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const thorClient = useThorClient()
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const network = useAppSelector(selectSelectedNetwork)

    return useQuery({
        queryKey: getVot3DelegateeQueryKey(selectedAccount?.address ?? "", network),
        queryFn: () => getVot3Delegatee(selectedAccount?.address ?? "", thorClient, network),
        select: data => data[0] as string,
        enabled: enabled && !!selectedAccount?.address && !!thorClient,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
