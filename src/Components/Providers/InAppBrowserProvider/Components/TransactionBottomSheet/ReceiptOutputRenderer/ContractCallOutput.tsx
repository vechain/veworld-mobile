import { TransactionClause } from "@vechain/sdk-core"
import { default as React } from "react"
import { useI18nContext } from "~i18n"
import { ReceiptOutput } from "~Services/AbiService"
import { BaseAdditionalDetail } from "./BaseAdditionalDetail"
import { BaseReceiptOutput } from "./BaseReceiptOutput"

type Props = {
    output: ReceiptOutput
    expanded: boolean
    clauses: TransactionClause[]
}

export const ContractCallOutput = ({ expanded, output, clauses }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            expanded={expanded}
            label={LL.RECEIPT_OUTPUT_CONTRACT_CALL()}
            iconKey="icon-unlock"
            additionalDetails={
                <>
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_CLAUSE()}
                        value={<BaseAdditionalDetail.StringValue value={`#${output.clauseIndex + 1}`} />}
                    />
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_TO()}
                        value={<BaseAdditionalDetail.HexValue value={clauses[output.clauseIndex].to ?? ""} />}
                    />
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_CONTRACT_DATA()}
                        value={<BaseAdditionalDetail.HexValue value={clauses[output.clauseIndex].data ?? "0x"} />}
                    />
                </>
            }
        />
    )
}
