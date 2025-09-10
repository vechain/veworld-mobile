import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VeDelegate, VET, VTHO } from "~Constants"
import { useOfficialTokens } from "~Hooks/useOfficialTokens"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance/useMultipleTokensBalance"
import { getUseUserTokensConfig } from "~Hooks/useUserTokens"
import { FungibleTokenWithBalance } from "~Model"
import {
    selectCustomTokensByAccount,
    selectNetworkVBDTokens,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"

export const useNonVechainTokensBalance = ({
    accountAddress,
    enabled = true,
}: {
    accountAddress?: string
    enabled?: boolean
} = {}) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const network = useAppSelector(selectSelectedNetwork)
    const parsedAddress = useMemo(
        () => accountAddress ?? selectedAccountAddress!,
        [accountAddress, selectedAccountAddress],
    )
    const { data: officialTokens, isLoading: isLoadingOfficialTokens } = useOfficialTokens()
    const customTokens = useAppSelector(state => selectCustomTokensByAccount(state, parsedAddress))
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const { data: userTokens, isLoading: isLoadingUserTokens } = useQuery({
        ...getUseUserTokensConfig({ address: parsedAddress, network }),
        enabled,
        select(data) {
            return data.filter(d => ![B3TR, VET, VTHO, VOT3].find(u => AddressUtils.compareAddresses(u.address, d)))
        },
    })
    const userValidTokens = useMemo(() => {
        if (!userTokens) return []
        if (!officialTokens) return []
        return userTokens
            .map(ut => {
                const foundOfficial = officialTokens.find(ot => AddressUtils.compareAddresses(ot.address, ut))
                if (foundOfficial) return foundOfficial
                const foundCustom = customTokens.find(ct => AddressUtils.compareAddresses(ct.address, ut))
                if (foundCustom) return foundCustom
                return null
            })
            .filter((u): u is NonNullable<typeof u> => Boolean(u))
    }, [customTokens, officialTokens, userTokens])

    const userValidTokenAddresses = useMemo(() => userValidTokens.map(u => u.address), [userValidTokens])
    const { data: balances, isLoading: isLoadingBalances } = useMultipleTokensBalance(
        userValidTokenAddresses,
        parsedAddress,
    )

    const tokensWithBalance = useMemo(
        () =>
            userValidTokens
                .map(
                    tk =>
                        ({
                            ...tk,
                            balance: balances?.find(b => AddressUtils.compareAddresses(b.tokenAddress, tk.address)) ?? {
                                balance: "0",
                                isHidden: false,
                                timeUpdated: new Date().toISOString(),
                                tokenAddress: tk.address,
                            },
                        } satisfies FungibleTokenWithBalance),
                )
                .filter(token => {
                    //Hide VeDelegate if the balance is exactly 0
                    if (!AddressUtils.compareAddresses(token.address, VeDelegate.address)) return true
                    return !BigNutils(token.balance.balance).isZero
                }),
        [balances, userValidTokens],
    )

    const isLoading = useMemo(
        () => isLoadingOfficialTokens || isLoadingUserTokens || isLoadingBalances,
        [isLoadingBalances, isLoadingOfficialTokens, isLoadingUserTokens],
    )

    return useMemo(() => ({ isLoading, data: tokensWithBalance }), [isLoading, tokensWithBalance])
}
