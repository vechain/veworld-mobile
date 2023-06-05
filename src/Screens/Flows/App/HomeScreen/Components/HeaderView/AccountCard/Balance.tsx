import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme, VET } from "~Common"
import { FormattingUtils } from "~Utils"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import BigNumber from "bignumber.js"
import {
    selectVetTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { WalletAccount } from "~Model"

type Props = {
    isVisible: boolean
    toggleVisible: () => void
    account: WalletAccount
}

export const Balance: React.FC<Props> = memo(
    ({ isVisible, toggleVisible, account }) => {
        const theme = useTheme()
        const { LL } = useI18nContext()

        const vetTokenWithBalance = useAppSelector(state =>
            selectVetTokenWithBalanceByAccount(state, account.address),
        )
        const balance = new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetTokenWithBalance?.balance.balance || "0",
                1,
                VET.decimals,
            ),
        ).toString()

        const renderBalance = useMemo(() => {
            if (isVisible) return FormattingUtils.humanNumber(balance, balance)
            return Array.from(
                Array(FormattingUtils.humanNumber(balance).length).keys(),
            ).map(_value => "*")
        }, [balance, isVisible])

        return (
            <>
                <BaseView flexDirection="row">
                    <BaseText
                        color={theme.colors.textReversed}
                        typographyFont="body">
                        {LL.BD_YOUR_BALANCE()}
                    </BaseText>
                    <BaseIcon
                        onPress={toggleVisible}
                        name={isVisible ? "eye-off" : "eye"}
                        color={theme.colors.textReversed}
                        size={18}
                        style={baseStyles.marginLeft}
                    />
                </BaseView>
                <BaseView flexDirection="row" alignItems="baseline">
                    <BaseText
                        color={theme.colors.textReversed}
                        typographyFont="hugeTitle">
                        {renderBalance}
                    </BaseText>
                    <BaseText
                        mx={4}
                        color={theme.colors.textReversed}
                        typographyFont="body">
                        {VET.symbol}
                    </BaseText>
                </BaseView>
            </>
        )
    },
)

const baseStyles = StyleSheet.create({
    marginLeft: {
        marginLeft: 8,
    },
})
