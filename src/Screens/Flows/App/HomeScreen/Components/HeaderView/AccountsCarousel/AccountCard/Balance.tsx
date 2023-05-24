import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme, VET } from "~Common"
import { FormattingUtils } from "~Utils"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    balance: string
    isVisible: boolean
    toggleVisible: () => void
}

const getBalanceText = (balance: string, isVisible: boolean) => {
    if (isVisible) return FormattingUtils.humanNumber(balance, balance)
    return Array.from(
        Array(FormattingUtils.humanNumber(balance).length).keys(),
    ).map(_value => "*")
}
export const Balance: React.FC<Props> = memo(
    ({ balance, isVisible, toggleVisible }) => {
        const theme = useTheme()
        const { LL } = useI18nContext()

        const renderBalance = useMemo(
            () => getBalanceText(balance, isVisible),
            [balance, isVisible],
        )

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
