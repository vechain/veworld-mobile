import { default as React, useMemo } from "react"
import { DIRECTIONS, VET } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseAdditionalDetail } from "../BaseAdditionalDetail"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<
    "Transfer(indexed address,indexed address,uint256)" | "VET_TRANSFER(address,address,uint256)"
>

export const TokenReceiveOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()
    const tokens = useAppSelector(selectAllTokens)
    const { formatLocale } = useFormatFiat()

    const token = useMemo(() => {
        if (output.name === "VET_TRANSFER(address,address,uint256)") return VET
        return tokens.find(tk => AddressUtils.compareAddresses(tk.address, output.address!))
    }, [output.address, output.name, tokens])

    const value = useMemo(() => {
        if (output.name === "VET_TRANSFER(address,address,uint256)") return output.params.amount
        return output.params.value
    }, [output.name, output.params])

    const amountHuman = useMemo(
        () =>
            BigNutils(value.toString())
                .toHuman(token?.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [formatLocale, value, token?.decimals],
    )

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_TOKEN_RECEIVE()}
            iconKey="icon-arrow-down"
            output={output}
            additionalDetails={
                <BaseAdditionalDetail
                    label={LL.ADDITIONAL_DETAIL_SENDER()}
                    value={<BaseAdditionalDetail.HexValue value={output.params.from} testID="TOKEN_RECEIVE_SENDER" />}
                />
            }
            {...props}>
            <BaseReceiptOutput.ValueContainer>
                <BaseReceiptOutput.ValueMainText testID="TOKEN_RECEIVE_VALUE">
                    {`${DIRECTIONS.UP} ${amountHuman} ${token?.symbol}`}
                </BaseReceiptOutput.ValueMainText>
            </BaseReceiptOutput.ValueContainer>
        </BaseReceiptOutput>
    )
}
