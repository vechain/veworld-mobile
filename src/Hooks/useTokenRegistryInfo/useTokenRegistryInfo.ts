import { useMemo } from "react"
import { FungibleToken, TokenSocialLinks } from "~Model"
import { VET, VTHO } from "~Constants"
import { useI18nContext } from "~i18n"

export type TokenRegistryInfo = {
    description?: string
    socialLinks?: TokenSocialLinks
}

/**
 * Custom hook to get token description and social links from token registry.
 * Handles special cases like VET which has a hardcoded description with i18n support.
 * For wrapped tokens (crossChainProvider exists), returns only description from registry.
 *
 * @param token - The fungible token object
 * @returns TokenRegistryInfo with description and social links
 */
export const useTokenRegistryInfo = (token: FungibleToken): TokenRegistryInfo => {
    const { LL } = useI18nContext()

    return useMemo(() => {
        const isVET = token.symbol === VET.symbol
        const isWrappedToken = !!token.crossChainProvider

        // For VET, use hardcoded i18n description and VTHO's social links
        if (isVET) {
            return {
                description: LL.TOKEN_DESCRIPTION_VET(),
                socialLinks: VTHO.socialLinks,
            }
        }

        // For wrapped tokens, only return description from registry (no social links)
        if (isWrappedToken) {
            return {
                description: token.desc,
                socialLinks: undefined,
            }
        }

        // For regular tokens, return both description and social links from registry
        return {
            description: token.desc,
            socialLinks: token.socialLinks,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])
}
