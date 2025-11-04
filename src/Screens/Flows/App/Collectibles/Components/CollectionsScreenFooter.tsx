import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectBlackListedAddresses, useAppSelector } from "~Storage/Redux"

export const CollectionsScreenFooter = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const blackListedCollections = useAppSelector(selectBlackListedAddresses)
    const nav = useNavigation()

    const onGoToBlackListed = useCallback(() => nav.navigate(Routes.BLACKLISTED_COLLECTIONS), [nav])

    if (blackListedCollections.length === 0) return null

    return (
        <BaseButton
            action={onGoToBlackListed}
            style={styles.button}
            typographyFont="captionSemiBold"
            textColor={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
            rightIcon={
                <BaseIcon
                    name="icon-eye-off"
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                    style={styles.icon}
                />
            }
            radius={6}
            bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200}
            px={12}
            py={8}>
            {LL.COLLECTIONS_VIEW_HIDDEN()}
        </BaseButton>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        button: { marginTop: 32, width: "auto", alignSelf: "flex-start" },
        icon: { marginLeft: 8 },
        list: { marginTop: 16 },
    })
