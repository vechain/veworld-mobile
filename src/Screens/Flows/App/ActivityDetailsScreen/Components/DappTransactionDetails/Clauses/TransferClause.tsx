import React, { memo } from "react"
import { BaseView } from "~Components"
import { ClauseWithMetadata } from "~Model"
import { ClauseDetail } from "../ClauseDetail"
import { useI18nContext } from "~i18n"
import { useCopyClipboard } from "~Hooks"
import { SCREEN_WIDTH } from "~Constants"
import { AddressUtils } from "~Utils"

type Props = {
    clause: ClauseWithMetadata
}

export const TransferClause: React.FC<Props> = memo(({ clause }) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail title={LL.TYPE()} value={LL.CONNECTED_APP_token_transfer()} />
            {clause.to !== null && (
                <ClauseDetail
                    title={LL.TO()}
                    value={AddressUtils.humanAddress(clause.to, 7, 9)}
                    onValuePress={() => onCopyToClipboard(clause.to ?? "", LL.COMMON_LBL_ADDRESS())}
                    valueIcon="icon-copy"
                />
            )}
            {clause.tokenSymbol && <ClauseDetail title={LL.TOKEN_SYMBOL()} value={clause.tokenSymbol} border={false} />}
        </BaseView>
    )
})
