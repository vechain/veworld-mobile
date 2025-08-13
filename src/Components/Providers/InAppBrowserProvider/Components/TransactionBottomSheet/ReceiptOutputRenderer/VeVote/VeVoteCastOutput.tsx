import React from "react"
import { useI18nContext } from "~i18n"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"VeVote_VoteCast(address,uint256,uint8,string,uint256,uint256[],address)">

export const VeVoteCastOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    return <BaseReceiptOutput label={LL.RECEIPT_OUTPUT_VEVOTE_CAST()} iconKey="icon-vote" output={output} {...props} />
}
