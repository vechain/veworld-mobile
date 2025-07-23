import { default as React, useMemo } from "react"
import { FiatBalance } from "~Components"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useTheme, useTokenWithCompleteInfo } from "~Hooks"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import {
    selectBalanceForToken,
    selectNetworkVBDTokens,
    selectSelectedAccountAddress,
    useAppSelector,
} from "~Storage/Redux"
import { BalanceUtils, BigNutils } from "~Utils"

type AccountFiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = (props: AccountFiatBalanceProps) => {
    const { isLoading: _isLoading = false, isVisible = true } = props
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const accountAddress = useAppSelector(selectSelectedAccountAddress)

    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const vot3RawBalance = useAppSelector(state => selectBalanceForToken(state, VOT3.address))

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        tokenWithInfoB3TR.exchangeRate ?? 0,
        VOT3.decimals,
    )

    const nonVechaiTokensFiat = useNonVechainTokenFiat()

    const { data: stargateNodes, isLoading: loadingNodes } = useUserNodes(accountAddress)
    const { ownedStargateNfts: stargateNfts, isLoading: loadingStargateNfts } = useUserStargateNfts(
        stargateNodes,
        loadingNodes,
    )

    const totalStargateVet = useMemo(() => {
        return stargateNfts.reduce((acc, nft) => {
            return acc.plus(nft.vetAmountStaked ?? "0")
        }, BigNutils("0"))
    }, [stargateNfts])

    const stargateFiatBalance = useMemo(() => {
        return BalanceUtils.getFiatBalance(totalStargateVet.toString, tokenWithInfoVET.exchangeRate ?? 1, VET.decimals)
    }, [totalStargateVet, tokenWithInfoVET.exchangeRate])

    const isLoading = useMemo(() => _isLoading || loadingStargateNfts, [_isLoading, loadingStargateNfts])

    const sum = useMemo(
        () =>
            Number(tokenWithInfoVET.fiatBalance) +
            Number(tokenWithInfoVTHO.fiatBalance) +
            Number(tokenWithInfoB3TR.fiatBalance) +
            Number(vot3FiatBalance) +
            Number(nonVechaiTokensFiat.reduce((a, b) => Number(a) + Number(b), 0)) +
            Number(stargateFiatBalance),
        [
            tokenWithInfoVET.fiatBalance,
            tokenWithInfoVTHO.fiatBalance,
            tokenWithInfoB3TR.fiatBalance,
            vot3FiatBalance,
            nonVechaiTokensFiat,
            stargateFiatBalance,
        ],
    )

    const isLong = useMemo(() => sum.toFixed(2).length > 12, [sum])

    return (
        <FiatBalance
            isLoading={isLoading}
            isVisible={isVisible}
            color={theme.colors.textReversed}
            typographyFont={isLong ? "title" : "largeTitle"}
            balances={[
                tokenWithInfoVET.fiatBalance,
                tokenWithInfoVTHO.fiatBalance,
                tokenWithInfoB3TR.fiatBalance,
                vot3FiatBalance,
                ...nonVechaiTokensFiat,
                stargateFiatBalance,
            ]}
        />
    )
}

export default AccountFiatBalance
