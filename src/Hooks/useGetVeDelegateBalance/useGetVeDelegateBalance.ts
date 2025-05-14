import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { abis, VeDelegate } from "~Constants"
import { utils } from "ethers"
import { BigNutils } from "~Utils"

export const getVeDelegateBalance = async (
    thor: Connex.Thor,
    address?: string,
): Promise<{ original: string; scaled: string; formatted: string }> => {
    const res = await thor.account(VeDelegate.address).method(abis.VIP180.balanceOf).call(address)

    if (res.reverted) throw new Error("Reverted")

    const original = res.decoded[0]
    const scaled = utils.formatEther(original)
    const formatted = scaled === "0" ? "0" : BigNutils(scaled).toTokenFormat_string(18)

    return {
        original,
        scaled,
        formatted,
    }
}

export const getVeDelegateBalanceQueryKey = (address?: string) => ["VE_DELEGATE_BALANCE", address]

export const useGetVeDelegateBalance = (address?: string) => {
    const thor = useThor()

    return useQuery({
        queryKey: getVeDelegateBalanceQueryKey(address),
        queryFn: async () => getVeDelegateBalance(thor, address),
        enabled: !!thor && !!address,
    })
}
