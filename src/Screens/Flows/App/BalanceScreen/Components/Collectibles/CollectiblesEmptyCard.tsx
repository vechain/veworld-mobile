import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

export const CollectiblesEmptyCard = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.root} testID="VEBETTER_DAO_CARD">
            <BaseView px={24} pb={24} flexDirection="column" gap={24} alignItems="center">
                <BaseView
                    borderRadius={32}
                    bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_100}
                    p={16}
                    flex={0}
                    alignItems="center"
                    justifyContent="center">
                    <BaseIcon
                        name="icon-image"
                        size={32}
                        color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_400}
                    />
                </BaseView>
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800} typographyFont="body" align="center">
                    {"Transfer a collectible to start building your collection"}
                </BaseText>
                <BaseButton
                    action={() => {}}
                    variant="solid"
                    rightIcon={
                        <BaseIcon
                            name="icon-arrow-down"
                            color={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
                            size={20}
                        />
                    }
                    typographyFont="bodySemiBold"
                    w={100}
                    style={styles.button}
                    textColor={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
                    bgColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                    selfAlign="center">
                    {LL.COMMON_RECEIVE()}
                </BaseButton>
            </BaseView>

            <BaseSpacer height={1} background={theme.isDark ? COLORS.PURPLE_DISABLED : theme.colors.background} />

            <BaseView p={24} flexDirection="row" gap={8}>
                <BaseIcon name="icon-leafs" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} size={16} py={4} />
                <BaseText color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} typographyFont="subSubTitleSemiBold">
                    {LL.VBD_YOUR_OFFSET()}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            paddingTop: 32,
            position: "relative",
            flexDirection: "column",
            borderRadius: 16,
        },
        actionsText: {
            fontWeight: 600,
            fontSize: 40,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        button: {
            justifyContent: "center",
            gap: 12,
        },
    })
