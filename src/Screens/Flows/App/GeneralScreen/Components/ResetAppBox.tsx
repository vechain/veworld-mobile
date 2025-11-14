import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const ResetAppBox = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const onReset = useCallback(() => nav.navigate(Routes.RESET_APP), [nav])
    const textColor = useMemo(() => {
        return theme.isDark ? COLORS.WHITE : COLORS.PURPLE
    }, [theme])

    return (
        <BaseView
            p={24}
            gap={16}
            flexDirection="column"
            alignItems="flex-start"
            borderRadius={8}
            bg={theme.colors.card}>
            <BaseView gap={8} flexDirection="column" alignItems="flex-start">
                <BaseView flexDirection="row" alignItems="center" gap={8}>
                    <BaseIcon name="icon-rotate-ccw" size={16} color={textColor} />
                    <BaseText typographyFont="bodySemiBold" color={textColor}>
                        {LL.BD_RESET()}
                    </BaseText>
                </BaseView>
                <BaseText typographyFont="caption" color={theme.colors.subtitle}>
                    {LL.BD_RESET_DISCLAIMER()}
                </BaseText>
            </BaseView>
            <BaseButton
                size="sm"
                radius={6}
                style={styles.button}
                textColor={COLORS.WHITE}
                bgColor={COLORS.RED_600}
                typographyFont="captionSemiBold"
                title={LL.BTN_RESET_APP()}
                action={onReset}
                haptics="Medium"
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        button: {
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
    })
