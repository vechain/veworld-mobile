import { memo, default as React, useMemo } from "react"
import { BaseView } from "~Components"
import { SCREEN_WIDTH } from "~Constants"
import { TokenAllowanceActivity, useCopyClipboard } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { ClauseDetail } from "../ClauseDetail"

type Props = {
    output: TokenAllowanceActivity
}

export const TokenAllowance = memo(({ output }: Props) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    const tokenBalances = useAppSelector(selectTokensWithBalances)

    const token = useMemo(
        () => tokenBalances.find(tk => AddressUtils.compareAddresses(tk.address, output.tokenAddress)),
        [output.tokenAddress, tokenBalances],
    )

    return (
        <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
            <ClauseDetail title={LL.TYPE()} value={LL.CONNECTED_APP_token_allowance()} />
            <ClauseDetail
                title={LL.VALUE_TITLE()}
                value={`${BigNutils(output.amount).toHuman(token?.decimals ?? 18).toString} ${
                    token?.symbol ?? token?.name ?? LL.UNKNOWN_ACCOUNT()
                }`}
            />
            <ClauseDetail
                title={LL.CONNECTED_APP_token_allowance_spender()}
                value={AddressUtils.humanAddress(output.spender, 7, 9)}
                onValuePress={() => onCopyToClipboard(output.spender, LL.COMMON_LBL_ADDRESS())}
                valueIcon="icon-copy"
                border={false}
            />
        </BaseView>
    )
})
