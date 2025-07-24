import { default as React, useMemo } from "react"
import { BaseText } from "~Components/Base"
import { DIRECTIONS } from "~Constants"
import { useFormatFiat } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ReceiptOutput } from "~Services/AbiService"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseReceiptOutput } from "./BaseReceiptOutput"

type Props = {
    output: Extract<ReceiptOutput, { name: "Transfer(indexed address,indexed address,uint256)" }>
    expanded: boolean
}

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
        <BaseReceiptOutput expanded={expanded} label={LL.RECEIPT_OUTPUT_TOKEN_RECEIVE()} iconKey="icon-arrow-down">
            <BaseReceiptOutput.ValueMainText>
                <BaseText>{`${DIRECTIONS.UP} ${amountHuman} ${token?.symbol}`}</BaseText>
            </BaseReceiptOutput.ValueMainText>
        </BaseReceiptOutput>
    )
}
