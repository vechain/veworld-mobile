import React, { useMemo } from "react"
import { useFormatFiat } from "~Hooks"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { FungibleTokenWithBalance } from "~Model"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"
import { BalanceTabActions } from "./BalanceTabActions"
import { ValueContainer } from "./ValueContainer"

type Props = {
    token: FungibleTokenWithBalance
}

export const BalanceTab = ({ token: _token }: Props) => {
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)
    const isVOT3OrB3TR = useMemo(() => ["B3TR", "VOT3"].includes(_token.symbol), [_token.symbol])
    const { data: vot3Balance } = useTokenBalance({ tokenAddress: VOT3.address, enabled: isVOT3OrB3TR })
    const { data: b3trBalance } = useTokenBalance({ tokenAddress: B3TR.address, enabled: isVOT3OrB3TR })

    const token = useMemo(() => {
        if (!isVOT3OrB3TR) return _token
        const veBetterBalances = [vot3Balance, b3trBalance].filter(
            (balance): balance is NonNullable<typeof balance> => !!balance,
        )
        return {
            ..._token,
            balance: {
                balance: veBetterBalances
                    .reduce((acc, curr) => acc.plus(curr.balance), BigNutils("0"))
                    .toBigInt.toString(),
                isHidden: veBetterBalances.some(balance => balance.isHidden),
                timeUpdated: veBetterBalances[0].timeUpdated,
                tokenAddress: veBetterBalances[0].tokenAddress,
            },
        }
    }, [_token, b3trBalance, isVOT3OrB3TR, vot3Balance])

    const b3trToken = useMemo(() => {
        return {
            ...B3TR,
            balance: b3trBalance,
        }
    }, [B3TR, b3trBalance])

    const vot3Token = useMemo(() => {
        return {
            ...VOT3,
            balance: vot3Balance,
        }
    }, [VOT3, vot3Balance])

    const { fiatBalance: totalFiatBalance, showFiatBalance, tokenBalance } = useTokenCardBalance({ token })
    const { fiatBalance: b3trFiatBalance } = useTokenCardBalance({ token: b3trToken })
    const { fiatBalance: vot3FiatBalance } = useTokenCardBalance({ token: vot3Token })
    const { formatLocale } = useFormatFiat()
    return (
        <>
            <ValueContainer>
                {isVOT3OrB3TR ? (
                    <>
                        {b3trToken.balance && (
                            <ValueContainer.TokenFiatValue
                                token={b3trToken}
                                value={formatTokenAmount(
                                    b3trToken.balance.balance,
                                    b3trToken.symbol,
                                    b3trToken.decimals ?? 0,
                                    {
                                        locale: formatLocale,
                                        includeSymbol: false,
                                    },
                                )}
                                fiatValue={b3trFiatBalance}
                                border
                            />
                        )}
                        {vot3Token.balance && (
                            <ValueContainer.TokenFiatValue
                                token={vot3Token}
                                value={formatTokenAmount(
                                    vot3Token.balance.balance,
                                    vot3Token.symbol,
                                    vot3Token.decimals ?? 0,
                                    {
                                        locale: formatLocale,
                                        includeSymbol: false,
                                    },
                                )}
                                fiatValue={vot3FiatBalance}
                                border
                            />
                        )}
                    </>
                ) : (
                    <ValueContainer.TokenValue token={token} value={tokenBalance} border={!!showFiatBalance} />
                )}
                {showFiatBalance && <ValueContainer.DollarValue value={totalFiatBalance} testID="DOLLAR_VALUE" />}
            </ValueContainer>
            <BalanceTabActions token={token} />
        </>
    )
}
