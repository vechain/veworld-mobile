import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"

import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

const VBD_URL = "https://governance.vebetterdao.org"

interface VeBetterDaoActionGroupProps {
    onShareCard: () => void
    isSharing?: boolean
}

export const VeBetterDaoActionGroup = ({ onShareCard, isSharing = false }: VeBetterDaoActionGroupProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()

    const onVeBetterNavigate = useCallback(() => {
        navigateWithTab({
            url: VBD_URL,
            title: VBD_URL,
            navigationFn(url) {
                nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    return (
        <BaseView
            py={16}
            testID="VEBETTER_DAO_ACTION_GROUP"
            flexDirection="row"
            gap={16}
            justifyContent="space-between">
            <BaseTouchable
                action={onVeBetterNavigate}
                testID="VEBETTER_DAO_CARD_GO_TO_VBD"
                haptics="Medium"
                activeOpacity={0.2}
                style={styles.goToVbdButton}>
                <BaseView flexDirection="row" gap={8} justifyContent="center" alignItems="center">
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.button}>
                        {LL.TITLE_VEBETTER()}
                    </BaseText>
                    <BaseIcon name="icon-arrow-link" color={theme.colors.button} size={18} />
                </BaseView>
            </BaseTouchable>
            <BaseTouchable
                action={onShareCard}
                testID="VEBETTER_DAO_CARD_SHARE"
                haptics="Medium"
                activeOpacity={0.2}
                disabled={isSharing}
                style={styles.goToVbdButton}>
                <BaseView flexDirection="row" gap={8} justifyContent="center" alignItems="center">
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.button}>
                        {LL.SHARE()}
                    </BaseText>
                    <BaseIcon name="icon-share-2" color={theme.colors.button} size={18} />
                </BaseView>
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        goToVbdButton: {
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: 4,
            flex: 1,
            height: 42,
            justifyContent: "center",
            alignItems: "center",
        },
    })
