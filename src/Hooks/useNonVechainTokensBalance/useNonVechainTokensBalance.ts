import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VET, VTHO } from "~Constants"
import { useOfficialTokens } from "~Hooks/useOfficialTokens"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance/useMultipleTokensBalance"
import { getUseUserTokensConfig } from "~Hooks/useUserTokens"
import { FungibleTokenWithBalance } from "~Model"
import {
    selectCustomTokens,
    selectNetworkVBDTokens,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useNonVechainTokensBalance = ({ accountAddress }: { accountAddress?: string }) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const network = useAppSelector(selectSelectedNetwork)
    const parsedAddress = useMemo(
        () => accountAddress ?? selectedAccountAddress!,
        [accountAddress, selectedAccountAddress],
    )
    const { data: officialTokens } = useOfficialTokens()
    const customTokens = useAppSelector(selectCustomTokens)
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const { data: userTokens } = useQuery({
        ...getUseUserTokensConfig({ address: parsedAddress, network }),
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
    const _tokenBalances = useMultipleTokensBalance(userValidTokenAddresses, parsedAddress)

    return useMemo(
        () =>
            userValidTokens.map(
                tk =>
                    ({
                        ...tk,
                        balance: _tokenBalances?.find(b =>
                            AddressUtils.compareAddresses(b.tokenAddress, tk.address),
                        ) ?? {
                            balance: "0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: tk.address,
                        },
                    } satisfies FungibleTokenWithBalance),
            ),
        [_tokenBalances, userValidTokens],
    )
}
