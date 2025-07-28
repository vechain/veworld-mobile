import { default as React, useMemo } from "react"
import { B3TR, COLORS, DIRECTIONS } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BigNutils } from "~Utils"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<
    "B3TR_ClaimReward(address,address,uint256,uint256)" | "B3TR_ClaimReward_V2(address,address,uint256,uint256)"
>

export const B3TRClaimRewardsOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    const { formatLocale } = useFormatFiat()

    const amountHuman = useMemo(
        () =>
            BigNutils(output.params.value.toString())
                .toHuman(B3TR.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [output.params.value, formatLocale],
    )

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_CLAIM_VOTING_REWARDS()}
            iconKey="icon-gift"
            iconBg={COLORS.B3TR_ICON_BACKGROUND}
            iconColor={COLORS.GREY_700}
            output={output}
            {...props}>
            <BaseReceiptOutput.ValueContainer flexDirection="column" gap={2}>
                <BaseReceiptOutput.ValueMainText testID="B3TR_CLAIM_REWARDS_VALUE">
                    {`${DIRECTIONS.UP} ${amountHuman} ${B3TR.symbol}`}
                </BaseReceiptOutput.ValueMainText>
            </BaseReceiptOutput.ValueContainer>
        </BaseReceiptOutput>
    )
}
