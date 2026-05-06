import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { VeBetterDao } from "~Constants/Constants/Thor/abis"
import { useThorClient } from "~Hooks/useThorClient"
import { selectSelectedAccountOrNull, selectSelectedNetwork } from "~Storage/Redux"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { Network } from "~Model"
import { TEST_VOT3_ADDRESS, VOT3 } from "~Constants"
import { formatEther } from "ethers/lib/utils"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"

const getUnlockedVot3Balance = async (address: string, thorClient: ThorClient, network: Network) => {
    return await thorClient.contracts
        .load(network.type === "mainnet" ? VOT3.address : TEST_VOT3_ADDRESS, [
            { ...VeBetterDao.Vot3Abis.unlockedBalance, stateMutability: "view" },
        ])
        .read.unlockedBalance(address)
}

export const getUnlockedVot3BalanceQueryKey = (address: string, network: Network) => [
    "VEBETTERDAO",
    "VOT3",
    "UNLOCKED_BALANCE",
    address,
    network.type,
]

export const useGetUnlockedVot3Balance = () => {
    const thorClient = useThorClient()
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const network = useAppSelector(selectSelectedNetwork)

    return useQuery({
        queryKey: getUnlockedVot3BalanceQueryKey(selectedAccount?.address ?? "", network),
        queryFn: () => getUnlockedVot3Balance(selectedAccount?.address ?? "", thorClient, network),
        select: data => {
            const raw = data[0] as bigint
            return {
                original: raw,
                hex: `0x${raw.toString(16)}`,
                scaled: formatEther(raw),
                formatted: formatTokenAmount(raw.toString(), VOT3.symbol, VOT3.decimals, { includeSymbol: false }),
            }
        },
        enabled: !!selectedAccount?.address && !!thorClient,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
