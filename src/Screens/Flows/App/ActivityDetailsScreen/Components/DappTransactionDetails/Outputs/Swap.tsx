import { BigNumber as BN } from "bignumber.js"
import { memo, default as React, useCallback } from "react"
import { BaseView } from "~Components"
import { SCREEN_WIDTH, VET } from "~Constants"
import { SwapOutput, SwapType } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { ClauseDetail } from "../ClauseDetail"

type Props = {
    output: SwapOutput
}

const renderTokenValue = (value: BN, token: FungibleToken | undefined, unknownTokenName: string) => {
    return `${
        BigNutils(value)
            .toHuman(token?.decimals ?? 18)
            .decimals(2).toString
    } ${token?.symbol ?? token?.name ?? unknownTokenName}`
}

export const Swap = memo(({ output }: Props) => {
    const { LL } = useI18nContext()

    const tokenBalances = useAppSelector(selectAllTokens)

    const ValueOutput = useCallback(() => {
        switch (output.swapType) {
            case SwapType.VET_TO_FT: {
                const outputToken = tokenBalances.find(token =>
                    AddressUtils.compareAddresses(token.address, output.toToken),
                )
                return (
                    <ClauseDetail
                        title={LL.VALUE_TITLE()}
                        value={`${BigNutils(output.amountIn).toHuman(VET.decimals).toString} ${
                            VET.symbol
                        } -> ${renderTokenValue(output.amountOut, outputToken, LL.UNKNOWN_ACCOUNT())}`}
                    />
                )
            }
            case SwapType.FT_TO_VET: {
                const inputToken = tokenBalances.find(token =>
                    AddressUtils.compareAddresses(token.address, output.fromToken),
                )
                return (
                    <ClauseDetail
                        title={LL.VALUE_TITLE()}
                        value={`${renderTokenValue(output.amountIn, inputToken, LL.UNKNOWN_ACCOUNT())} -> ${
                            BigNutils(output.amountOut).toHuman(VET.decimals).decimals(2).toString
                        } ${VET.symbol}`}
                    />
                )
            }
            case SwapType.FT_TO_FT: {
                const inputToken = tokenBalances.find(token =>
                    AddressUtils.compareAddresses(token.address, output.fromToken),
                )
                const outputToken = tokenBalances.find(token =>
                    AddressUtils.compareAddresses(token.address, output.toToken),
                )
                return (
                    <ClauseDetail
                        title={LL.VALUE_TITLE()}
                        value={`${renderTokenValue(
                            output.amountIn,
                            inputToken,
                            LL.UNKNOWN_ACCOUNT(),
                        )} -> ${renderTokenValue(output.amountOut, outputToken, LL.UNKNOWN_ACCOUNT())}`}
                    />
                )
            }
        }
    }, [LL, output, tokenBalances])

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail title={LL.TYPE()} value={LL.CONNECTED_APP_token_swap()} />

            <ValueOutput />
        </BaseView>
    )
})
