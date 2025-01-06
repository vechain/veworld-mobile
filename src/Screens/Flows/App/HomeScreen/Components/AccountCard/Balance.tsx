import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { WalletAccount } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import AccountFiatBalance from "./AccountFiatBalance"

type Props = {
    isVisible: boolean
    toggleVisible: () => void
    account: WalletAccount
}

export const Balance: React.FC<Props> = memo(({ isVisible, toggleVisible }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    return (
        <BaseView>
            <BaseView flexDirection="row">
                <BaseText color={theme.colors.textSecondary} typographyFont="body">
                    {LL.BD_YOUR_BALANCE()}
                </BaseText>
                <BaseIcon
                    action={toggleVisible}
                    haptics="Light"
                    name={isVisible ? "icon-eye-off" : "icon-eye"}
                    color={theme.colors.textSecondary}
                    size={18}
                    style={baseStyles.marginLeft}
                />
            </BaseView>
            <BaseView flexDirection="row" alignItems="baseline">
                <AccountFiatBalance isLoading={isTokensOwnedLoading} isVisible={isVisible} />
            </BaseView>
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    marginLeft: {
        marginLeft: 8,
    },
})
