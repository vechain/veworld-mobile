import { default as React } from "react"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { BaseReceiptOutput, ReceiptOutputProps } from "../BaseReceiptOutput"

type Props = ReceiptOutputProps<"B3TR_XAllocationVote(address,uint256,bytes32[],uint256[])">

export const B3TRRoundVoteOutput = ({ output, ...props }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseReceiptOutput
            //Convert to Number since rounds won't ever go over the NUMBER limit
            label={LL.RECEIPT_OUTPUT_ROUND_VOTE({ roundId: Number(output.params.roundId) })}
            iconKey="icon-vote"
            iconBg={COLORS.B3TR_ICON_BACKGROUND}
            iconColor={COLORS.GREY_700}
            output={output}
            {...props}
        />
    )
}
