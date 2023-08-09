import React from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onPress: () => void
}

export const NoTokensButton: React.FC<Props> = ({ onPress }) => {
    const theme = useTheme()

    const { LL } = useI18nContext()

    return (
        <>
            <BaseButton
                haptics="Light"
                action={onPress}
                bgColor={theme.colors.secondary}
                style={baseStyles.plusContactButton}
                w={40}
                h={75}>
                <BaseView alignItems="center" pt={10}>
                    <BaseIcon
                        size={32}
                        name="arrow-down"
                        color={COLORS.DARK_PURPLE}
                    />
                    <BaseText
                        py={10}
                        typographyFont="bodyMedium"
                        color={COLORS.DARK_PURPLE}>
                        {LL.MANAGE_CUSTOM_TOKENS_RECEIVE_TOKENS()}
                    </BaseText>
                </BaseView>
            </BaseButton>
            <BaseText pt={15} typographyFont="body">
                {LL.SB_YOUR_TOKENS_EMPTY()}
            </BaseText>
        </>
    )
}

const baseStyles = StyleSheet.create({
    plusContactButton: {
        justifyContent: "center",
        flexDirection: "column",
    },
})
