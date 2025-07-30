import { TransactionClause } from "@vechain/sdk-core"
import { default as React, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { ReceiptOutput } from "~Services/AbiService"
import { stripFakeSignature } from "~Services/AbiService/ReceiptOutput"
import { BaseAdditionalDetail } from "./BaseAdditionalDetail"
import { BaseReceiptOutput } from "./BaseReceiptOutput"

type Props = {
    output: ReceiptOutput
    expanded: boolean
    clause: TransactionClause
}

export const ContractCallOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    const isUnknownOutput = useMemo(() => output.name === "___INTERNAL_UNKNOWN___", [output.name])

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_CONTRACT_CALL()}
            iconKey={isUnknownOutput ? "icon-help-circle" : "icon-file-check"}
            output={output}
            additionalDetails={
                !isUnknownOutput && (
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_EVENT()}
                        value={stripFakeSignature(output.name)}
                        testID="CONTRACT_CALL_FAKE_SIGNATURE"
                    />
                )
            }
            {...props}
        />
    )
}
