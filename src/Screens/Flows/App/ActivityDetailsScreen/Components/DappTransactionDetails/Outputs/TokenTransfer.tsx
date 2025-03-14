import React, { memo, useMemo } from "react"
import { BaseView } from "~Components"
import { SCREEN_WIDTH } from "~Constants"
import { TokenTransferActivity, TransferType, useCopyClipboard } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { ClauseDetail } from "../ClauseDetail"

type Props = {
    output: TokenTransferActivity
}

export const TokenTransfer = memo(({ output }: Props) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    const tokenBalances = useAppSelector(selectTokensWithBalances)

    const token = useMemo(
        () => tokenBalances.find(tk => AddressUtils.compareAddresses(tk.address, output.tokenAddress)),
        [output.tokenAddress, tokenBalances],
    )

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
            <ClauseDetail title={LL.TOKEN_SYMBOL()} value={token?.symbol ?? token?.name ?? LL.UNKNOWN_ACCOUNT()} />
            <ClauseDetail
                title={LL.VALUE_TITLE()}
                value={BigNutils(output.amount).toHuman(token?.decimals ?? 18).toString}
                border={false}
            />
        </BaseView>
    )
})
