import React from "react"
import { useBalances } from "~Common"
import { TokenWithCompleteInfo } from "~Model"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

export const BalanceView = ({ token }: { token: TokenWithCompleteInfo }) => {
    const { LL } = useI18nContext()
    const { fiatBalance, tokenUnitBalance } = useBalances({ token })
    const currency = useAppSelector(selectCurrency)

    return (
        <BaseView w={100}>
            <BaseView flexDirection="row" alignItems="flex-end">
                <BaseText typographyFont="bodyBold">
                    {LL.BD_YOUR_BALANCE()}
                </BaseText>
                <BaseSpacer width={4} />
                <BaseText typographyFont="caption">{`${fiatBalance} ${currency}`}</BaseText>
            </BaseView>

            <BaseSpacer height={4} />

            <BaseView flexDirection="row">
                <BaseText>{tokenUnitBalance}</BaseText>
                <BaseSpacer width={4} />
                <BaseText typographyFont="bodyBold">{token.symbol}</BaseText>
            </BaseView>
        </BaseView>
    )
}
