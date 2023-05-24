import React, { memo } from "react"
import { BaseView } from "~Components"
import { ClauseWithMetadata } from "~Model"
import { ClauseDetail } from "../ClauseDetail"
import { useI18nContext } from "~i18n"
import { SCREEN_WIDTH, useCopyClipboard } from "~Common"
import { FormattingUtils } from "~Utils"

type Props = {
    clause: ClauseWithMetadata
}

export const ContractCallClause: React.FC<Props> = memo(({ clause }) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail
                title={LL.TYPE()}
                value={LL.CONNECTED_APP_contract_call()}
            />
            {clause.to && (
                <ClauseDetail
                    title={LL.TO()}
                    value={FormattingUtils.humanAddress(clause.to, 7, 9)}
                    onValuePress={() =>
                        onCopyToClipboard(
                            clause.to ?? "",
                            LL.COMMON_LBL_ADDRESS(),
                        )
                    }
                    valueIcon="content-copy"
                />
            )}

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
