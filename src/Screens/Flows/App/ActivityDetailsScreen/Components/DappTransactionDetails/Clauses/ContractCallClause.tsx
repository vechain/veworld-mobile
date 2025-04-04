import React, { memo } from "react"
import { BaseView } from "~Components"
import { SCREEN_WIDTH } from "~Constants"
import { useCopyClipboard } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ClauseWithMetadata } from "~Model"
import { AddressUtils } from "~Utils"
import { ClauseDetail } from "../ClauseDetail"

type Props = {
    clause: ClauseWithMetadata
}

export const ContractCallClause: React.FC<Props> = memo(({ clause }) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 88 }}>
            <ClauseDetail title={LL.TYPE()} value={LL.CONNECTED_APP_contract_call()} />
            {clause.to && (
                <ClauseDetail
                    title={LL.TO()}
                    value={AddressUtils.humanAddress(clause.to)}
                    onValuePress={() => onCopyToClipboard(clause.to ?? "", LL.COMMON_LBL_ADDRESS())}
                    valueIcon="icon-copy"
                />
            )}

            <ClauseDetail
                title={LL.CONTRACT_DATA()}
                value={AddressUtils.humanAddress(clause.data, 7, 9)}
                border={false}
                onValuePress={() => onCopyToClipboard(clause.to ?? "", LL.COMMON_LBL_DATA())}
                valueIcon="icon-copy"
            />
        </BaseView>
    )
})
