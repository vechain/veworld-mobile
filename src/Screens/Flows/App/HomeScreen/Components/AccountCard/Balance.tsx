import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { COLORS, VET } from "~Constants"
import { useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { BaseIcon, BaseSkeleton, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectIsTokensOwnedLoading,
    selectVetBalanceByAccount,
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

        const balance = useAppSelector(state =>
            selectVetBalanceByAccount(state, account.address),
        )

        const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

        const renderBalance = useMemo(() => {
            if (isVisible) return FormattingUtils.humanNumber(balance, balance)
            return Array.from(
                Array(FormattingUtils.humanNumber(balance).length).keys(),
            ).map(_value => "•")
        }, [balance, isVisible])

        const computeFonts = useMemo(
            () => (renderBalance.length > 9 ? "title" : "largeTitle"),
            [renderBalance.length],
        )

        return (
            <BaseView>
                <BaseView flexDirection="row">
                    <BaseText
                        color={theme.colors.textReversed}
                        typographyFont="body">
                        {LL.BD_YOUR_BALANCE()}
                    </BaseText>
                    <BaseIcon
                        action={toggleVisible}
                        haptics="Light"
                        name={isVisible ? "eye-off" : "eye"}
                        color={theme.colors.textReversed}
                        size={18}
                        style={baseStyles.marginLeft}
                    />
                </BaseView>
                <BaseView flexDirection="row" alignItems="baseline">
                    {isTokensOwnedLoading ? (
                        <BaseView pt={4}>
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={
                                    theme.isDark
                                        ? COLORS.LIME_GREEN
                                        : COLORS.DARK_PURPLE
                                }
                                highlightColor={COLORS.LIGHT_PURPLE}
                                height={renderBalance.length > 9 ? 22 : 45}
                                width={140}
                            />
                        </BaseView>
                    ) : (
                        <BaseText
                            color={theme.colors.textReversed}
                            typographyFont={computeFonts}>
                            {renderBalance}
                        </BaseText>
                    )}

                    <BaseText
                        mx={4}
                        color={theme.colors.textReversed}
                        typographyFont="body">
                        {VET.symbol}
                    </BaseText>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = StyleSheet.create({
    marginLeft: {
        marginLeft: 8,
    },
})
