import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon } from "~Components/Base"
import { COLORS, DIRECTIONS } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseReceiptOutput, ReceiptOutputProps } from "./BaseReceiptOutput"

type Props = ReceiptOutputProps<
    | "B3TR_Vot3ToB3trSwap(address,address,address,address,uint256,uint256)"
    | "B3TR_B3trToVot3Swap(address,address,address,address,uint256,uint256)"
>

const NativeSwapIcon = () => {
    const { styles } = useThemedStyles(baseStyles)
    return <BaseIcon name="icon-convert" size={12} style={styles.icon} color={COLORS.GREY_700} />
}

export const NativeB3TRSwap = ({ expanded, output }: Props) => {
    const { LL } = useI18nContext()
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)
    const { formatLocale } = useFormatFiat()

    const amountInHuman = useMemo(
        () =>
            BigNutils(output.params.inputValue.toString())
                .toHuman(B3TR.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [output.params.inputValue, B3TR.decimals, formatLocale],
    )

    const amountOutHuman = useMemo(
        () =>
            BigNutils(output.params.outputValue.toString())
                .toHuman(B3TR.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [output.params.outputValue, B3TR.decimals, formatLocale],
    )

    const inputTokenSymbol = useMemo(
        () => (AddressUtils.compareAddresses(output.params.inputToken, B3TR.address) ? B3TR.symbol : VOT3.symbol),
        [B3TR.address, B3TR.symbol, VOT3.symbol, output.params.inputToken],
    )

    const outputTokenSymbol = useMemo(
        () => (inputTokenSymbol === B3TR.symbol ? VOT3.symbol : B3TR.symbol),
        [B3TR.symbol, VOT3.symbol, inputTokenSymbol],
    )

    return (
        <BaseReceiptOutput
            expanded={expanded}
            label={LL.RECEIPT_OUTPUT_TOKEN_RECEIVE()}
            iconNode={<NativeSwapIcon />}
            output={output}>
            <BaseReceiptOutput.ValueContainer flexDirection="column" gap={2}>
                <BaseReceiptOutput.ValueMainText>
                    {`${DIRECTIONS.UP} ${amountInHuman} ${inputTokenSymbol}`}
                </BaseReceiptOutput.ValueMainText>
                <BaseReceiptOutput.ValueSubText>
                    {`${DIRECTIONS.DOWN} ${amountOutHuman} ${outputTokenSymbol}`}
                </BaseReceiptOutput.ValueSubText>
            </BaseReceiptOutput.ValueContainer>
        </BaseReceiptOutput>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            backgroundColor: COLORS.B3TR_ICON_BACKGROUND,
            padding: 6,
        },
    })
