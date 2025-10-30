import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { TwitterSVG, TelegramSVG } from "~Assets/IconComponents"

const ALLOWED_SOCIAL_LINKS = ["website", "twitter", "telegram"] as const
type AllowedSocialLink = (typeof ALLOWED_SOCIAL_LINKS)[number]

type SocialLinksButtonsProps = {
    socialLinks?: {
        website?: string
        twitter?: string
        telegram?: string
    }
    onNavigate: (url: string) => void
}

const SOCIAL_BUTTON_FLEX = {
    website: 2,
    iconOnly: 1,
} as const

export const SocialLinksButtons = ({ socialLinks, onNavigate }: SocialLinksButtonsProps): JSX.Element | null => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const filteredLinks = useMemo(() => {
        if (!socialLinks) return []
        return Object.entries(socialLinks).filter(([key]) =>
            ALLOWED_SOCIAL_LINKS.includes(key as AllowedSocialLink),
        ) as Array<[AllowedSocialLink, string]>
    }, [socialLinks])

    const renderLeftIcon = useCallback(
        (key: AllowedSocialLink) => {
            if (key === "website")
                return (
                    <BaseIcon name="icon-globe" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500} size={20} />
                )
            if (key === "twitter")
                return <TwitterSVG color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500} width={20} height={20} />
            if (key === "telegram")
                return <TelegramSVG color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500} width={20} height={20} />
            return null
        },
        [theme],
    )

    const renderSocialButton = useCallback(
        ([key, value]: [AllowedSocialLink, string]) => {
            const isWebsite = key === "website"

            return (
                <BaseButton
                    key={key}
                    flex={isWebsite ? SOCIAL_BUTTON_FLEX.website : SOCIAL_BUTTON_FLEX.iconOnly}
                    testID={`${key}_BUTTON`}
                    action={() => onNavigate(value)}
                    style={styles.button}
                    size="md"
                    leftIcon={renderLeftIcon(key)}
                    typographyFont="bodySemiBold"
                    textStyle={isWebsite ? styles.buttonText : undefined}
                    bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.WHITE}
                    textColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500}
                    selfAlign="center">
                    {isWebsite ? LL.COMMON_WEBSITE() : null}
                </BaseButton>
            )
        },
        [onNavigate, styles, theme, LL, renderLeftIcon],
    )

    if (filteredLinks.length === 0) return null

    return (
        <BaseView flexDirection="row" alignItems="center" gap={16} justifyContent="space-between" my={12}>
            {filteredLinks.map(renderSocialButton)}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        button: {
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            paddingHorizontal: 12,
        },

        buttonText: {
            marginLeft: 12,
        },
    })
