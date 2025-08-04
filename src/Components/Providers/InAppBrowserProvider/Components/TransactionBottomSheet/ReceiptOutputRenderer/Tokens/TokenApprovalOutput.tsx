import { default as React, useMemo } from "react"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"Approval(indexed address,indexed address,uint256)">

export const TokenApprovalOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()
    const tokens = useAppSelector(selectAllTokens)
    const token = useMemo(
        () => tokens.find(tk => AddressUtils.compareAddresses(tk.address, output.address!)),
        [output.address, tokens],
    )
    const { formatLocale } = useFormatFiat()

    const amountHuman = useMemo(
        () =>
            BigNutils(output.params.value.toString())
                .toHuman(token?.decimals ?? 18)
                .toTokenFormat_string(2, formatLocale),
        [formatLocale, output.params.value, token?.decimals],
    )

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_TOKEN_APPROVE()}
            iconKey="icon-key"
            output={output}
            additionalDetails={
                <BaseAdditionalDetail
                    label={LL.ADDITIONAL_DETAIL_SPENDER()}
                    value={
                        <BaseAdditionalDetail.HexValue value={output.params.spender} testID="TOKEN_APPROVAL_SPENDER" />
                    }
                />
            }
            {...props}>
            <BaseReceiptOutput.ValueContainer>
                <BaseReceiptOutput.ValueMainText testID="TOKEN_APPROVAL_VALUE">
                    {`${amountHuman} ${token?.symbol ?? LL.RECEIPT_OUTPUT_GENERIC_TOKEN()}`}
                </BaseReceiptOutput.ValueMainText>
            </BaseReceiptOutput.ValueContainer>
        </BaseReceiptOutput>
    )
}
