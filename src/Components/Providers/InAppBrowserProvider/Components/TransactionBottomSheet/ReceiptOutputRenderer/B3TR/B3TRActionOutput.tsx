import { default as React, useMemo } from "react"
import { B3TR, COLORS, DIRECTIONS } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAllDapps, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"B3TR_ActionReward(address,address,uint256,bytes32,string)">

export const B3TRActionOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()
    const apps = useAppSelector(selectAllDapps)

    const amountHuman = useMemo(
        () =>
            BigNutils(output.params.value.toString())
                .toHuman(B3TR.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [output.params.value, formatLocale],
    )

    const app = useMemo(
        () => apps.find(dapp => dapp.veBetterDaoId?.toLowerCase() === output.params.appId.toLowerCase()),
        [apps, output.params.appId],
    )

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_B3TR_ACTION()}
            iconKey="icon-leaf"
            iconBg={COLORS.B3TR_ICON_BACKGROUND}
            iconColor={COLORS.GREY_700}
            output={output}
            additionalDetails={app && <BaseAdditionalDetail label={LL.ADDITIONAL_DETAIL_APP()} value={app.name} />}
            {...props}>
            <BaseReceiptOutput.ValueContainer flexDirection="column" gap={2}>
                <BaseReceiptOutput.ValueMainText>
                    {`${DIRECTIONS.UP} ${amountHuman} ${B3TR.symbol}`}
                </BaseReceiptOutput.ValueMainText>
            </BaseReceiptOutput.ValueContainer>
        </BaseReceiptOutput>
    )
}
