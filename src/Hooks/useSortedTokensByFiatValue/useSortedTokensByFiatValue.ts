import { useMemo } from "react"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance"
import { FungibleTokenWithBalance } from "~Model"
import { selectNetworkVBDTokens, selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

/**
 * Extract numeric value from formatted fiat balance string
 * Reusable utility that handles existing format from useTokenWithCompleteInfo
 * Handles formats like "< $0.01", "$1,234.56", etc.
 */
const extractFiatValue = (fiatBalanceString: string): number => {
    const numericMatch = fiatBalanceString.match(/[\d,]+\.?\d*/)?.[0]
    return numericMatch ? parseFloat(numericMatch.replace(/,/g, "")) : 0
}

/**
 * Pre-calculate all fiat values once instead of during every sort comparison
 */
const createFiatBalanceMap = (
    vetInfo: any,
    vthoInfo: any,
    b3trInfo: any,
    nonVechainTokensFiat: string[],
    nonVechainTokenWithBalances: FungibleTokenWithBalance[],
): Map<string, number> => {
    const fiatMap = new Map<string, number>()

    // VeChain ecosystem tokens
    fiatMap.set(VET.symbol, extractFiatValue(vetInfo.fiatBalance))
    fiatMap.set(VTHO.symbol, extractFiatValue(vthoInfo.fiatBalance))
    fiatMap.set("B3TR", extractFiatValue(b3trInfo.fiatBalance))

    // Non-VeChain tokens (including VeDelegate)
    nonVechainTokenWithBalances.forEach((token, index) => {
        if (nonVechainTokensFiat[index]) {
            const key = `${token.address}_${token.symbol}`
            fiatMap.set(key, extractFiatValue(nonVechainTokensFiat[index]))
        }
    })

    return fiatMap
}

/**
 * Get fiat balance
 */
const getTokenFiatBalance = (token: FungibleTokenWithBalance, fiatMap: Map<string, number>): number => {
    // Try symbol first (for VeChain tokens)
    const symbolValue = fiatMap.get(token.symbol)
    if (symbolValue !== undefined) return symbolValue

    // Try address+symbol combination (for non-VeChain tokens)
    const addressSymbolValue = fiatMap.get(`${token.address}_${token.symbol}`)
    if (addressSymbolValue !== undefined) return addressSymbolValue

    return 0
}

/**
 * Custom hook that provides tokens sorted by fiat balance (highest first)
 * Handles all token types: VET, VTHO, B3TR/VOT3, VeDelegate, and non-VeChain tokens
 */
export const useSortedTokensByFiatValue = (accountAddress?: string) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const address = accountAddress ?? selectedAccountAddress

    const { data: nonVechainTokenWithBalances, isLoading: isLoadingNonVechain } = useNonVechainTokensBalance({
        accountAddress: address,
    })
    const { B3TR: B3TRToken, VOT3: VOT3Token } = useAppSelector(selectNetworkVBDTokens)

    const vechainTokens = useMemo(
        () => [VET.address, VTHO.address, B3TRToken.address, VOT3Token.address],
        [B3TRToken.address, VOT3Token.address],
    )
    const { data: vechainTokenBalances, isLoading: isLoadingVechain } = useMultipleTokensBalance(vechainTokens)

    const vechainTokenWithBalances = useMemo(() => {
        if (!vechainTokenBalances) return []
        return [VET, VTHO, B3TRToken, VOT3Token].map((tk, idx) => ({ ...tk, balance: vechainTokenBalances?.[idx] }))
    }, [B3TRToken, VOT3Token, vechainTokenBalances])

    const tokenBalances = useMemo(
        () => vechainTokenWithBalances.concat(nonVechainTokenWithBalances).filter(tb => !tb.balance.isHidden),
        [nonVechainTokenWithBalances, vechainTokenWithBalances],
    )

    // Get fiat balance information
    const vetInfo = useTokenWithCompleteInfo(VET, address)
    const vthoInfo = useTokenWithCompleteInfo(VTHO, address)
    const b3trInfo = useTokenWithCompleteInfo(B3TRToken, address)
    const { data: nonVechainTokensFiat, isLoading: isLoadingNonVechainTokensFiat } = useNonVechainTokenFiat({
        accountAddress: address,
    })

    const sortedTokens = useMemo(() => {
        const notVBDBalances = tokenBalances.filter(tb => ![B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))
        const vbdBalances = tokenBalances.filter(tb => [B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))

        let finalBalances: FungibleTokenWithBalance[] = notVBDBalances

        if (vbdBalances.length > 0) {
            const totalVbd = vbdBalances.reduce((acc, curr) => acc.plus(curr.balance.balance), BigNutils("0"))
            const combinedVBDToken: FungibleTokenWithBalance = {
                address: B3TRToken.address,
                balance: {
                    balance: totalVbd.toBigInt.toString(),
                    isHidden: vbdBalances.some(token => token.balance.isHidden),
                    timeUpdated: vbdBalances[0].balance.timeUpdated,
                    tokenAddress: vbdBalances[0].balance.tokenAddress,
                },
                custom: false,
                decimals: B3TRToken.decimals,
                icon: B3TRToken.icon,
                name: B3TRToken.name,
                symbol: B3TRToken.symbol,
                desc: B3TRToken.desc,
            }
            finalBalances = [...notVBDBalances, combinedVBDToken]
        }

        // Create fiat balance lookup map
        const fiatMap = createFiatBalanceMap(
            vetInfo,
            vthoInfo,
            b3trInfo,
            nonVechainTokensFiat,
            nonVechainTokenWithBalances,
        )

        // Sort using pre-calculated fiat values
        return finalBalances.sort((a, b) => {
            const fiatValueA = getTokenFiatBalance(a, fiatMap)
            const fiatValueB = getTokenFiatBalance(b, fiatMap)
            return fiatValueB - fiatValueA
        })
    }, [
        tokenBalances,
        vetInfo,
        vthoInfo,
        b3trInfo,
        nonVechainTokensFiat,
        nonVechainTokenWithBalances,
        B3TRToken,
        VOT3Token.symbol,
    ])

    const isLoading =
        isLoadingNonVechain ||
        isLoadingVechain ||
        vetInfo.tokenInfoLoading ||
        vthoInfo.tokenInfoLoading ||
        b3trInfo.tokenInfoLoading ||
        isLoadingNonVechainTokensFiat

    return {
        tokens: sortedTokens,
        isLoading,
    }
}
