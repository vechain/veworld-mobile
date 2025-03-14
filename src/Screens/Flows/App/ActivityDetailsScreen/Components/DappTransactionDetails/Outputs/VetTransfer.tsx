import React, { memo } from "react"
import { BaseView } from "~Components"
import { SCREEN_WIDTH, VET } from "~Constants"
import { TransferType, useCopyClipboard, VetTransferActivity } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AddressUtils, BigNutils } from "~Utils"
import { ClauseDetail } from "../ClauseDetail"

type Props = {
    output: VetTransferActivity
}

export const VetTransfer = memo(({ output }: Props) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail title={LL.TYPE()} value={LL.CONNECTED_APP_token_transfer()} />
            {output.transferType === TransferType.RECEIVE ? (
                <ClauseDetail
                    title={LL.FROM()}
                    value={AddressUtils.humanAddress(output.sender, 7, 9)}
                    onValuePress={() => onCopyToClipboard(output.sender, LL.COMMON_LBL_ADDRESS())}
                    valueIcon="icon-copy"
                />
            ) : (
                <ClauseDetail
                    title={LL.TO()}
                    value={AddressUtils.humanAddress(output.recipient, 7, 9)}
                    onValuePress={() => onCopyToClipboard(output.recipient ?? "", LL.COMMON_LBL_ADDRESS())}
                    valueIcon="icon-copy"
                />
            )}
            <ClauseDetail title={LL.TOKEN_SYMBOL()} value={VET.symbol} />
            <ClauseDetail
                title={LL.VALUE_TITLE()}
                value={BigNutils(output.amount).toHuman(VET.decimals).toString}
                border={false}
            />
        </BaseView>
    )
})
