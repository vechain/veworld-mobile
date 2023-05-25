import React, { memo } from "react"
import { BaseView } from "~Components"
import { ClauseWithMetadata } from "~Model"
import { ClauseDetail } from "../ClauseDetail"
import { useI18nContext } from "~i18n"
import { FormattingUtils, SCREEN_WIDTH, useCopyClipboard } from "~Common"

type Props = {
    clause: ClauseWithMetadata
}

export const SwapVetForTokensClause: React.FC<Props> = memo(({ clause }) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail
                title={LL.TYPE()}
                value={LL.CONNECTED_APP_swap_vet_for_tokens()}
            />

            <ClauseDetail
                title={LL.CONTRACT_DATA()}
                value={FormattingUtils.humanAddress(clause.data, 7, 9)}
                border={false}
                onValuePress={() =>
                    onCopyToClipboard(clause.to ?? "", LL.COMMON_LBL_DATA())
                }
                valueIcon="content-copy"
            />
        </BaseView>
    )
})
