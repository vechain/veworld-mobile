import { default as React } from "react"
import { BaseView } from "~Components/Base"
import { useI18nContext } from "~i18n"
import { ReceiptOutput } from "~Services/AbiService"
import { BaseReceiptOutput } from "./BaseReceiptOutput"

type Props = {
    output: ReceiptOutput
    expanded: boolean
}

export const ContractCallOutput = ({ expanded }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            expanded={expanded}
            label={LL.RECEIPT_OUTPUT_CONTRACT_CALL()}
            iconKey="icon-unlock"
            additionalDetails={<BaseView />}
        />
    )
}
