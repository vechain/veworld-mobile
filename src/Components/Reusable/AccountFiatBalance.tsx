import { default as React, useMemo } from "react"
import { FiatBalance } from "~Components"
import { VET, VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { selectNetworkVBDTokens, selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils } from "~Utils"

type AccountFiatBalanceProps = {
    isVisible?: boolean
}

const parseFiatBalance = (value: string) => {
    //Fiat balances that have a value < 0.01, have the value set as '< < 0.01'
    if (value.includes("<")) return 0
    return Number(value)
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = ({ isVisible = true }: AccountFiatBalanceProps) => {
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const accountAddress = useAppSelector(selectSelectedAccountAddress)

    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const { data: vot3RawBalance, isLoading: loadingVot3Balance } = useTokenBalance({
        address: accountAddress,
        tokenAddress: VOT3.address,
    })

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
        const isNodeOwner = stargateNodes.some(node => AddressUtils.compareAddresses(node.xNodeOwner, accountAddress))

        if (!isNodeOwner) return "0"

        return BalanceUtils.getFiatBalance(totalStargateVet.toString, tokenWithInfoVET.exchangeRate ?? 1, VET.decimals)
    }, [totalStargateVet, tokenWithInfoVET.exchangeRate, stargateNodes, accountAddress])

    const isLoading = useMemo(
        () =>
            loadingStargateNfts ||
            tokenWithInfoVET.tokenInfoLoading ||
            tokenWithInfoVTHO.tokenInfoLoading ||
            tokenWithInfoB3TR.tokenInfoLoading ||
            loadingVot3Balance,
        [
            loadingStargateNfts,
            loadingVot3Balance,
            tokenWithInfoB3TR.tokenInfoLoading,
            tokenWithInfoVET.tokenInfoLoading,
            tokenWithInfoVTHO.tokenInfoLoading,
        ],
    )

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
