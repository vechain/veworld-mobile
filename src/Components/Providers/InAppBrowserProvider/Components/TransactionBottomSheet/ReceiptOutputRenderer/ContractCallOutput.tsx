import { TransactionClause } from "@vechain/sdk-core"
import { default as React } from "react"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ReceiptOutput } from "~Services/AbiService"
import { BaseReceiptOutput } from "./BaseReceiptOutput"

type Props = {
    output: ReceiptOutput
    expanded: boolean
    clause: TransactionClause
}

export const ContractCallOutput = (props: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_CONTRACT_CALL()}
            iconKey="icon-help-circle"
            iconColor={theme.isDark ? COLORS.ORANGE_300 : COLORS.ORANGE_500}
            labelColor={theme.isDark ? COLORS.ORANGE_300 : COLORS.ORANGE_500}
            {...props}
        />
    )
}
