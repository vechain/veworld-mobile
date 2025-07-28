import React, { useMemo } from "react"
import { DIRECTIONS, VET } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<
    | "FT_VET_Swap(address,address,address,uint256,uint256)"
    | "FT_VET_Swap2(address,address,address,uint256,uint256)"
    | "VET_FT_Swap(address,address,address,uint256,uint256)"
    | "Token_FTSwap(address,address,address,address,uint256,uint256)"
>

export const SwapOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()
    const tokens = useAppSelector(selectAllTokens)
    const { formatLocale } = useFormatFiat()

    const parsed = useMemo(() => {
        switch (output.name) {
            case "FT_VET_Swap(address,address,address,uint256,uint256)":
                return {
                    inputValue: output.params.inputValue,
                    inputToken: output.params.inputToken,
                    outputToken: VET.address,
                    outputValue: output.params.outputValue,
                }
            case "FT_VET_Swap2(address,address,address,uint256,uint256)":
                return {
                    inputValue: output.params.inputValue,
                    inputToken: output.params.inputToken,
                    outputToken: VET.address,
                    outputValue: output.params.outputValue,
                }
            case "VET_FT_Swap(address,address,address,uint256,uint256)":
                return {
                    inputValue: output.params.inputValue,
                    inputToken: VET.address,
                    outputToken: output.params.outputToken,
                    outputValue: output.params.outputValue,
                }
            case "Token_FTSwap(address,address,address,address,uint256,uint256)":
                return {
                    inputValue: output.params.inputValue,
                    inputToken: output.params.inputToken,
                    outputToken: output.params.outputToken,
                    outputValue: output.params.outputValue,
                }
        }
    }, [output.name, output.params])

    const inputToken = useMemo(
        () => tokens.find(tk => AddressUtils.compareAddresses(tk.address, parsed.inputToken)),
        [parsed.inputToken, tokens],
    )
    const outputToken = useMemo(
        () => tokens.find(tk => AddressUtils.compareAddresses(tk.address, parsed.outputToken)),
        [parsed.outputToken, tokens],
    )

    const amountInHuman = useMemo(
        () =>
            BigNutils(parsed.inputValue.toString())
                .toHuman(inputToken?.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [formatLocale, inputToken?.decimals, parsed.inputValue],
    )

    const amountOutHuman = useMemo(
        () =>
            BigNutils(parsed.outputValue.toString())
                .toHuman(outputToken?.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [formatLocale, outputToken?.decimals, parsed.outputValue],
    )

    return (
        <BaseReceiptOutput label={LL.RECEIPT_OUTPUT_SWAP()} iconKey="icon-arrow-left-right" output={output} {...props}>
            <BaseReceiptOutput.ValueContainer flexDirection="column" gap={2}>
                <BaseReceiptOutput.ValueMainText>
                    {`${DIRECTIONS.DOWN} ${amountInHuman} ${inputToken?.symbol}`}
                </BaseReceiptOutput.ValueMainText>
                <BaseReceiptOutput.ValueSubText>
                    {`${DIRECTIONS.UP} ${amountOutHuman} ${outputToken?.symbol}`}
                </BaseReceiptOutput.ValueSubText>
            </BaseReceiptOutput.ValueContainer>
        </BaseReceiptOutput>
    )
}
