import React, { memo } from "react"
import { BaseView } from "~Components"
import { ClauseWithMetadata } from "~Model"
import { ClauseDetail } from "../ClauseDetail"
import { useI18nContext } from "~i18n"
import { FormattingUtils, SCREEN_WIDTH, useCopyClipboard } from "~Common"

type Props = {
    clause: ClauseWithMetadata
}

export const DeployContractClause: React.FC<Props> = memo(({ clause }) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail
                title={LL.TYPE()}
                value={LL.CONNECTED_APP_deploy_contract()}
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

            {clause.abi && (
                <ClauseDetail
                    title={LL.CONTRACT_ABI()}
                    value={LL.COPY_ABI()}
                    onValuePress={() =>
                        onCopyToClipboard(
                            JSON.stringify(clause.abi),
                            LL.COMMON_LBL_ADDRESS(),
                        )
                    }
                    valueIcon="content-copy"
                    border={false}
                />
            )}
        </BaseView>
    )
})
