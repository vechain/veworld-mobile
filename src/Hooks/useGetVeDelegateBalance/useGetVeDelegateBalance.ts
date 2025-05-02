import { useQuery } from "@tanstack/react-query"
import { NETWORK_TYPE } from "~Model"
import { ethers } from "ethers"
import { abis } from "~Constants"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useThor } from "~Components"

const veDelegateTokenContractAddress = {
    [NETWORK_TYPE.MAIN]: "0xD3f7b82Df5705D34f64C634d2dEf6B1cB3116950",
    [NETWORK_TYPE.TEST]: "0x0000000000000000000000000000000000000000",
    [NETWORK_TYPE.SOLO]: "0x0000000000000000000000000000000000000000",
    [NETWORK_TYPE.OTHER]: "0x0000000000000000000000000000000000000000",
}

export const getVeDelegateBalance = async (
    thor: Connex.Thor,
    network: NETWORK_TYPE,
    address?: string,
): Promise<{ original: string; scaled: string; formatted: string }> => {
    const res = await thor.account(veDelegateTokenContractAddress[network]).method(abis.VIP180.balanceOf).call(address)

    if (res.reverted) throw new Error("Reverted")

    const original = res.decoded[0]
    const scaled = ethers.utils.formatEther(original)
    const formatted = scaled === "0" ? "0" : ethers.utils.parseEther(scaled.toString()).toString()

    return {
        original,
        scaled,
        formatted,
    }
}

export const getVeDelegateBalanceQueryKey = (address?: string) => ["VE_DELEGATE_BALANCE", address]

export const useGetVeDelegateBalance = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const address = useAppSelector(selectSelectedAccount)
    const thor = useThor()

    return useQuery({
        queryKey: getVeDelegateBalanceQueryKey(),
        queryFn: () => getVeDelegateBalance(thor, network.type, address?.address),
        enabled: !!thor && !!address?.address,
    })
}
