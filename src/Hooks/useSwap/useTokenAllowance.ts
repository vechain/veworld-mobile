import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { abis } from "~Constants"
import { useThor } from "~Components/Providers/ConnexProvider/ConnexProvider"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type UseTokenAllowanceParams = {
    tokenAddress: string | undefined
    spenderAddress: string | undefined
}

export const useTokenAllowance = ({ tokenAddress, spenderAddress }: UseTokenAllowanceParams) => {
    const thor = useThor()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const enabled = useMemo(
        () => !!tokenAddress && tokenAddress !== "0x0" && !!spenderAddress,
        [tokenAddress, spenderAddress],
    )

    const { data: allowance, isLoading } = useQuery({
        queryKey: ["tokenAllowance", tokenAddress, spenderAddress, selectedAccount.address],
        queryFn: async () => {
            if (!tokenAddress || !spenderAddress) return "0"
            const res = await thor
                .account(tokenAddress)
                .method(abis.VIP180.allowance)
                .call(selectedAccount.address, spenderAddress)
            return res.decoded["0"] as string
        },
        enabled,
        staleTime: 15_000,
    })

    return { allowance: allowance ?? "0", isLoading }
}
