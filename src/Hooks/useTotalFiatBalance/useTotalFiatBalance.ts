import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VET, VTHO } from "~Constants"
import { useUserNodes } from "~Hooks/Staking"
import { useCombineFiatBalances } from "~Hooks/useCombineFiatBalances"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { selectBalanceVisible, selectNetworkVBDTokens, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils } from "~Utils"

type Args = {
    address: string
    enabled?: boolean
    useCompactNotation?: boolean
}

export const useTotalFiatBalance = ({ address, enabled = true, useCompactNotation }: Args) => {
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const isVisible = useAppSelector(selectBalanceVisible)

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET, address, { enabled })
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO, address, { enabled })
    const network = useAppSelector(selectSelectedNetwork)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR, address, { enabled })
    const { data: vot3RawBalance, isLoading: loadingVot3Balance } = useTokenBalance({
        address,
        tokenAddress: VOT3.address,
        enabled,
    })

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        tokenWithInfoB3TR.exchangeRate ?? 0,
        VOT3.decimals,
    )

    const { data: nonVechainTokensFiat } = useNonVechainTokenFiat({ accountAddress: address, enabled })

    const { data, isLoading: loadingNodes } = useUserNodes(address, enabled)

    const totalStargateVet = useMemo(() => {
        return data.reduce((acc, nft) => {
            return acc.plus(nft.vetAmountStaked ?? "0")
        }, BigNutils("0"))
    }, [data])

    const stargateFiatBalance = useMemo(() => {
        // We only include staked VET in fiat balance if user is the owner, not a manager - Stargate staking
        const isNodeOwner = data.some(node => AddressUtils.compareAddresses(node.xNodeOwner, address))

        if (!isNodeOwner) return "0"

        return BalanceUtils.getFiatBalance(totalStargateVet.toString, tokenWithInfoVET.exchangeRate ?? 1, VET.decimals)
    }, [totalStargateVet, tokenWithInfoVET.exchangeRate, data, address])

    const isLoading = useMemo(
        () =>
            loadingNodes ||
            tokenWithInfoVET.tokenInfoLoading ||
            tokenWithInfoVTHO.tokenInfoLoading ||
            tokenWithInfoB3TR.tokenInfoLoading ||
            loadingVot3Balance,
        [
            loadingNodes,
            loadingVot3Balance,
            tokenWithInfoB3TR.tokenInfoLoading,
            tokenWithInfoVET.tokenInfoLoading,
            tokenWithInfoVTHO.tokenInfoLoading,
        ],
    )
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

    const { data: previousBalance } = useQuery({
        queryKey: ["BALANCE", "TOTAL", network.genesis.id, address.toLowerCase()],
        queryFn: () => amount,
        enabled: !isLoading,
        staleTime: 5 * 60 * 1000,
    })

    const { formatFiat } = useFormatFiat({ useCompactNotation })
    const renderedBalance = useMemo(() => {
        if (isLoading) {
            return formatFiat({ amount: previousBalance ?? 0, cover: !isVisible })
        }
        const balance = formatFiat({ amount, cover: !isVisible })
        return areAlmostZero ? `< ${balance}` : balance
    }, [isLoading, formatFiat, amount, isVisible, areAlmostZero, previousBalance])

    return useMemo(
        () => ({ balances, isLoading, renderedBalance, rawAmount: amount }),
        [amount, balances, isLoading, renderedBalance],
    )
}
