import { default as React } from "react"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"B3TR_ProposalDeposit(address,address,uint256,uint256)">

export const B3TRProposalSupportOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            label={LL.RECEIPT_OUTPUT_PROPOSAL_SUPPORT()}
            iconKey="icon-vote"
            iconBg={COLORS.B3TR_ICON_BACKGROUND}
            iconColor={COLORS.GREY_700}
            output={output}
            testID="B3TR_PROPOSAL_SUPPORT"
            {...props}
        />
    )
}
