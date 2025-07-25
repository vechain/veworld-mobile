import { default as React } from "react"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"B3TR_ProposalVote(address,uint256,uint8,string,uint256,uint256)">

export const B3TRProposalVoteOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_PROPOSAL_VOTE()}
            iconKey="icon-vote"
            iconBg={COLORS.B3TR_ICON_BACKGROUND}
            iconColor={COLORS.GREY_700}
            output={output}
            {...props}
        />
    )
}
