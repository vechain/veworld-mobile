import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

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

const getSocialIconName = (key: string): string => {
    if (key === "website") return "icon-globe"
    return `icon-${key.toLowerCase()}`
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

    const renderSocialButton = useCallback(
        ([key, value]: [AllowedSocialLink, string]) => {
            const iconName = getSocialIconName(key)
            const isWebsite = key === "website"

            return (
                <BaseButton
                    key={key}
                    flex={isWebsite ? SOCIAL_BUTTON_FLEX.website : SOCIAL_BUTTON_FLEX.iconOnly}
                    testID={`${key}_BUTTON`}
                    action={() => onNavigate(value)}
                    style={styles.button}
                    size="md"
                    leftIcon={
                        <BaseIcon
                            name={iconName as any}
                            color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500}
                            size={20}
                        />
                    }
                    typographyFont="bodySemiBold"
                    textStyle={isWebsite ? styles.buttonText : undefined}
                    bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.WHITE}
                    textColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500}
                    selfAlign="center">
                    {isWebsite ? LL.COMMON_WEBSITE() : null}
                </BaseButton>
            )
        },
        [onNavigate, styles, theme, LL],
    )

    if (filteredLinks.length === 0) return null

    return (
        <BaseView flexDirection="row" alignItems="center" gap={16} justifyContent="space-between">
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
