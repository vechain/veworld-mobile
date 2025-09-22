import { useMemo } from "react"
import { VET, VTHO } from "~Constants"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import { useCombineFiatBalances } from "~Hooks/useCombineFiatBalances"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { AccountWithDevice } from "~Model"
import {
    selectB3trAddress,
    selectBalanceForTokenByAccount,
    selectBalanceVisible,
    selectNetworkVBDTokens,
    selectVot3Address,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils } from "~Utils"

type Args = {
    account: AccountWithDevice
    enabled: boolean
}

export const useTotalFiatBalance = ({ account, enabled }: Args) => {
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const accountAddress = useMemo(() => account.address, [account.address])
    const isVisible = useAppSelector(selectBalanceVisible)

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET, accountAddress)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO, accountAddress)

    const b3trAddress = useAppSelector(selectB3trAddress)
    const vot3Address = useAppSelector(selectVot3Address)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo({ ...B3TR, address: b3trAddress }, accountAddress)
    const vot3RawBalance = useAppSelector(state => selectBalanceForTokenByAccount(state, vot3Address, accountAddress))

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        tokenWithInfoB3TR.exchangeRate ?? 0,
        VOT3.decimals,
    )

    const nonVechainTokensFiat = useNonVechainTokenFiat(accountAddress)

    const { stargateNodes, isLoading: loadingNodes } = useUserNodes(accountAddress, enabled)

    const { ownedStargateNfts: stargateNfts, isLoading: loadingStargateNfts } = useUserStargateNfts({
        nodes: stargateNodes,
        isLoadingNodes: loadingNodes,
        address: account.address,
    })

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

    const isLoading = useMemo(() => loadingStargateNfts, [loadingStargateNfts])

    const balances = useMemo(
        () => [
            tokenWithInfoVET.fiatBalance,
            tokenWithInfoVTHO.fiatBalance,
            tokenWithInfoB3TR.fiatBalance,
            vot3FiatBalance,
            ...nonVechainTokensFiat,
            stargateFiatBalance,
        ],
        [
            nonVechainTokensFiat,
            stargateFiatBalance,
            tokenWithInfoB3TR.fiatBalance,
            tokenWithInfoVET.fiatBalance,
            tokenWithInfoVTHO.fiatBalance,
            vot3FiatBalance,
        ],
    )

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(() => combineFiatBalances(balances), [balances, combineFiatBalances])

    const { formatFiat } = useFormatFiat()
    const renderedBalance = useMemo(() => {
        const balance = formatFiat({ amount, cover: !isVisible })
        return areAlmostZero ? `< ${balance}` : balance
    }, [formatFiat, amount, isVisible, areAlmostZero])

    return useMemo(() => ({ balances, isLoading, renderedBalance }), [balances, isLoading, renderedBalance])
}
