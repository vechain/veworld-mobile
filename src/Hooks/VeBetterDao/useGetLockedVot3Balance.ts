import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { formatEther } from "viem"
import { VeBetterDao } from "~Constants/Constants/Thor/abis"
import { TEST_VOT3_ADDRESS, VOT3 } from "~Constants/Constants/Token"
import { useThorClient } from "~Hooks/useThorClient"
import { Network } from "~Model"
import { selectSelectedAccountOrNull, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"

export const getLockedVot3Balance = async (address: string, thor: ThorClient, network: Network) => {
    return await thor.contracts
        .load(network.type === "mainnet" ? VOT3.address : TEST_VOT3_ADDRESS, [
            { ...VeBetterDao.Vot3Abis.getNavigatorLockedAmount, stateMutability: "view" },
        ])
        .read.getNavigatorLockedAmount(address)
}

export const getLockedVot3BalanceQueryKey = (address: string, network: Network) => [
    "VEBETTERDAO",
    "VOT3",
    "NAVIGATOR_LOCKED_BALANCE",
    address,
    network.genesis.id,
]

export const useGetLockedVot3Balance = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const thor = useThorClient()
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const network = useAppSelector(selectSelectedNetwork)

    return useQuery({
        queryKey: getLockedVot3BalanceQueryKey(selectedAccount?.address ?? "", network),
        queryFn: () => getLockedVot3Balance(selectedAccount?.address ?? "", thor, network),
        select: data => {
            const raw = data[0] as bigint
            return {
                original: raw,
                hex: `0x${raw.toString(16)}`,
                scaled: formatEther(raw),
                formatted: formatTokenAmount(raw.toString(), VOT3.symbol, VOT3.decimals, { includeSymbol: false }),
            }
        },
        enabled: enabled && !!selectedAccount?.address && !!thor,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
