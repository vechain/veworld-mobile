import { useMemo } from "react"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenWithCompleteInfo, TokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { useMultipleTokensBalance, useTokenBalance } from "~Hooks/useTokenBalance"
import { useHasAnyVeBetterActions } from "~Hooks/useHasAnyVeBetterActions"
import { FungibleToken, FungibleTokenWithBalance } from "~Model"
import { selectNetworkVBDTokens, selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { BigNutils, BalanceUtils } from "~Utils"

/**
 * Extract numeric value from formatted fiat balance string
 * Reusable utility that handles existing format from useTokenWithCompleteInfo
 * Handles formats like "< $0.01", "$1,234.56", etc.
 */
const extractFiatValue = (fiatBalanceString: string): number => {
    const regex = /[\d,]+\.?\d*/
    const numericMatch = regex.exec(fiatBalanceString)?.[0]
    return numericMatch ? Number.parseFloat(numericMatch.replaceAll(",", "")) : 0
}

/**
 * Pre-calculate all fiat values once instead of during every sort comparison
 * Extracts numeric values from formatted fiat strings for efficient sorting
 */
const createFiatBalanceMap = (
    vetInfo: TokenWithCompleteInfo,
    vthoInfo: TokenWithCompleteInfo,
    b3trInfo: TokenWithCompleteInfo,
    b3trToken: FungibleToken,
    vot3Token: FungibleToken,
    vot3RawBalance: string,
    nonVechainTokensFiat: string[],
    nonVechainTokenWithBalances: FungibleTokenWithBalance[],
): Map<string, number> => {
    const fiatMap = new Map<string, number>()

    // VeChain ecosystem tokens - parse fiat balance strings
    fiatMap.set(VET.address, extractFiatValue(vetInfo.fiatBalance))
    fiatMap.set(VTHO.address, extractFiatValue(vthoInfo.fiatBalance))

    // Calculate combined B3TR + VOT3 fiat balance using numeric exchange rate
    // B3TR fiat is already calculated by useTokenWithCompleteInfo
    const b3trFiatValue = extractFiatValue(b3trInfo.fiatBalance)

    // VOT3 uses same exchange rate as B3TR (they're the same token)
    // Calculate VOT3 fiat directly from raw balance and exchange rate
    const vot3FiatRaw = BalanceUtils.getFiatBalance(vot3RawBalance, b3trInfo.exchangeRate ?? 0, vot3Token.decimals)
    const vot3FiatValue = extractFiatValue(vot3FiatRaw)

    // Combine both B3TR and VOT3 for sorting
    fiatMap.set(b3trToken.address, b3trFiatValue + vot3FiatValue)

    // Non-VeChain tokens (including VeDelegate)
    for (const [index, token] of nonVechainTokenWithBalances.entries()) {
        if (nonVechainTokensFiat[index]) {
            fiatMap.set(token.address, extractFiatValue(nonVechainTokensFiat[index]))
        }
    }

    return fiatMap
}

/**
 * Get fiat balance
 */
const getTokenFiatBalance = (token: FungibleTokenWithBalance, fiatMap: Map<string, number>): number => {
    // Use address as key for consistent lookup
    return fiatMap.get(token.address) ?? 0
}

/**
 * Custom hook that provides tokens sorted by fiat balance (highest first)
 * Handles all token types: VET, VTHO, B3TR/VOT3, VeDelegate, and non-VeChain tokens
 */
export const useSortedTokensByFiatValue = (accountAddress?: string) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const address = accountAddress ?? selectedAccountAddress

    const { data: hasAnyVeBetterActions } = useHasAnyVeBetterActions()
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
        return [VET, VTHO, B3TRToken, VOT3Token]
            .map((tk, idx) => ({ ...tk, balance: vechainTokenBalances?.[idx] }))
            .filter(tk => Boolean(tk.balance))
    }, [B3TRToken, VOT3Token, vechainTokenBalances])

    const tokenBalances = useMemo(
        () => vechainTokenWithBalances.concat(nonVechainTokenWithBalances).filter(tb => !tb.balance.isHidden),
        [nonVechainTokenWithBalances, vechainTokenWithBalances],
    )

    // Get fiat balance information
    const vetInfo = useTokenWithCompleteInfo(VET, address)
    const vthoInfo = useTokenWithCompleteInfo(VTHO, address)
    const b3trInfo = useTokenWithCompleteInfo(B3TRToken, address)
    const { data: vot3Balance } = useTokenBalance({
        tokenAddress: VOT3Token.address,
        address,
    })
    const { data: nonVechainTokensFiat, isLoading: isLoadingNonVechainTokensFiat } = useNonVechainTokenFiat({
        accountAddress: address,
    })

    const hasTokensWithBalance = tokenBalances.some(token => !BigNutils(token.balance.balance).isZero)
    const isNewUserWithNoTokens = !hasAnyVeBetterActions && !hasTokensWithBalance

    const sortedTokens = useMemo(() => {
        if (isNewUserWithNoTokens) {
            const vetToken: FungibleTokenWithBalance = {
                ...VET,
                balance: vetInfo.balance || {
                    balance: "0",
                    isHidden: false,
                    timeUpdated: Date.now().toString(),
                    tokenAddress: VET.address,
                },
            }

            const b3trToken: FungibleTokenWithBalance = {
                ...B3TRToken,
                balance: b3trInfo.balance || {
                    balance: "0",
                    isHidden: false,
                    timeUpdated: Date.now().toString(),
                    tokenAddress: B3TRToken.address,
                },
            }

            return [b3trToken, vetToken]
        }

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
            B3TRToken,
            VOT3Token,
            vot3Balance?.balance ?? "0",
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
        isNewUserWithNoTokens,
        tokenBalances,
        vetInfo,
        vthoInfo,
        b3trInfo,
        B3TRToken,
        VOT3Token,
        vot3Balance?.balance,
        nonVechainTokensFiat,
        nonVechainTokenWithBalances,
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
        isNewUserWithNoTokens,
    }
}
