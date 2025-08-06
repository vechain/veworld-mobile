import { default as React, useMemo } from "react"
import { FiatBalance } from "~Components"
import { VET, VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import {
    selectB3trAddress,
    selectBalanceForToken,
    selectNetworkVBDTokens,
    selectSelectedAccountAddress,
    selectVot3Address,
    useAppSelector,
} from "~Storage/Redux"
import { BalanceUtils, BigNutils } from "~Utils"

type AccountFiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
}

const parseFiatBalance = (value: string) => {
    //Fiat balances that have a value < 0.01, have the value set as '< < 0.01'
    if (value.includes("<")) return 0
    return Number(value)
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = (props: AccountFiatBalanceProps) => {
    const { isLoading: _isLoading = false, isVisible = true } = props
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const accountAddress = useAppSelector(selectSelectedAccountAddress)

    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)

    const b3trAddress = useAppSelector(selectB3trAddress)
    const vot3Address = useAppSelector(selectVot3Address)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo({ ...B3TR, address: b3trAddress })
    const vot3RawBalance = useAppSelector(state => selectBalanceForToken(state, vot3Address))

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        tokenWithInfoB3TR.exchangeRate ?? 0,
        VOT3.decimals,
    )

    const nonVechaiTokensFiat = useNonVechainTokenFiat()

    const { stargateNodes, isLoading: loadingNodes } = useUserNodes(accountAddress)

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
        // We only include staked VET in fiat balance if user is the owner, not a manager - Stargate staking
        const isManager = stargateNodes.some(node => !node.isXNodeDelegator)

        if (isManager) return "0"

        return BalanceUtils.getFiatBalance(totalStargateVet.toString, tokenWithInfoVET.exchangeRate ?? 1, VET.decimals)
    }, [totalStargateVet, tokenWithInfoVET.exchangeRate, stargateNodes])

    const isLoading = useMemo(() => _isLoading || loadingStargateNfts, [_isLoading, loadingStargateNfts])

    const sum = useMemo(
        () =>
            parseFiatBalance(tokenWithInfoVET.fiatBalance) +
            parseFiatBalance(tokenWithInfoVTHO.fiatBalance) +
            parseFiatBalance(tokenWithInfoB3TR.fiatBalance) +
            parseFiatBalance(vot3FiatBalance) +
            nonVechaiTokensFiat.reduce((a, b) => a + parseFiatBalance(b), 0) +
            parseFiatBalance(stargateFiatBalance),
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
