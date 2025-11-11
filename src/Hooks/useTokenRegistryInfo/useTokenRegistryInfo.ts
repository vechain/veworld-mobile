import { useMemo } from "react"
import { FungibleToken, TokenSocialLinks } from "~Model"
import { VET, VTHO } from "~Constants"
import { useI18nContext } from "~i18n"
import { selectOfficialTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export type TokenRegistryInfo = {
    description?: string
    links?: TokenSocialLinks
}

/**
 * Custom hook to get token description and social links from token registry.
 *
 * This hook looks up the token in selectOfficialTokens to get the enriched version
 * with desc and links from the registry, since the token passed in might come from
 * constants or other sources that don't have this data.
 *
 * Handles special cases:
 * - VET: uses hardcoded i18n description and VTHO's social links
 * - Wrapped tokens (crossChainProvider exists): returns only description from registry
 *
 * @param token - The fungible token object
 * @returns TokenRegistryInfo with description and social links from the registry
 */
export const useTokenRegistryInfo = (token: FungibleToken): TokenRegistryInfo => {
    const { LL } = useI18nContext()
    const officialTokens = useAppSelector(selectOfficialTokens)

    return useMemo(() => {
        const isVET = token.symbol === VET.symbol
        const isWrappedToken = !!token.crossChainProvider

        // For VET, use hardcoded i18n description and VTHO's social links
        if (isVET) {
            return {
                description: LL.TOKEN_DESCRIPTION_VET(),
                links: VTHO.links,
            }
        }
        const officialToken = officialTokens.find(tk => AddressUtils.compareAddresses(tk.address, token.address))

        const tokenWithRegistryData = officialToken || token

        if (isWrappedToken) {
            return {
                description: tokenWithRegistryData.desc,
                links: undefined,
            }
        }

        return {
            description: tokenWithRegistryData.desc,
            links: tokenWithRegistryData.links,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, officialTokens])
}
