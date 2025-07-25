import { default as React, useMemo } from "react"
import { BaseText } from "~Components/Base"
import { DIRECTIONS } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseReceiptOutput, ReceiptOutputProps } from "./BaseReceiptOutput"

type Props = ReceiptOutputProps<"Transfer(indexed address,indexed address,uint256)">

export const TokenReceiveOutput = ({ expanded, output }: Props) => {
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
                .toHuman(token?.decimals ?? 0)
                .toTokenFormat_string(2, formatLocale),
        [formatLocale, output.params.value, token?.decimals],
    )

    return (
        <BaseReceiptOutput
            expanded={expanded}
            label={LL.RECEIPT_OUTPUT_TOKEN_RECEIVE()}
            iconKey="icon-arrow-down"
            output={output}>
            <BaseReceiptOutput.ValueMainText>
                <BaseText>{`${DIRECTIONS.UP} ${amountHuman} ${token?.symbol}`}</BaseText>
            </BaseReceiptOutput.ValueMainText>
        </BaseReceiptOutput>
    )
}
