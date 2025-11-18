import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { TelegramSVG, TwitterSVG } from "~Assets/IconComponents"
import { BaseButton, BaseIcon, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

const ALLOWED_SOCIAL_LINKS = ["website", "twitter", "telegram"] as const
type AllowedSocialLink = (typeof ALLOWED_SOCIAL_LINKS)[number]

type SocialLinksButtonsProps = {
    links?: {
        website?: string
        twitter?: string
        telegram?: string
    }
    onNavigate: (url: string, key: "website" | "twitter" | "telegram") => void
}

const SOCIAL_BUTTON_FLEX = {
    website: 2,
    iconOnly: 1,
} as const

export const SocialLinksButtons = ({ links, onNavigate }: SocialLinksButtonsProps): JSX.Element | null => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const filteredLinks = useMemo<[AllowedSocialLink, string][]>(() => {
        if (!links) return []
        return ALLOWED_SOCIAL_LINKS.filter(l => Boolean(links[l])).map(key => [key, links[key]!])
    }, [links])

    const renderLeftIcon = useCallback(
        (key: AllowedSocialLink) => {
            if (key === "website")
                return (
                    <BaseIcon name="icon-globe" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_600} size={20} />
                )
            if (key === "twitter")
                return <TwitterSVG color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_600} width={20} height={20} />
            if (key === "telegram")
                return <TelegramSVG color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_600} width={20} height={20} />
            return null
        },
        [theme],
    )

    const renderSocialButton = useCallback(
        ([key, value]: [AllowedSocialLink, string]) => {
            const isWebsite = key === "website"

            const flexValue = isWebsite ? SOCIAL_BUTTON_FLEX.website : SOCIAL_BUTTON_FLEX.iconOnly

            return (
                <BaseButton
                    key={key}
                    flex={filteredLinks.length === 3 ? flexValue : 0}
                    testID={`${key}_BUTTON`}
                    numberOfLines={1}
                    textProps={{ ellipsizeMode: "tail" }}
                    action={() => onNavigate(value, key)}
                    style={styles.button}
                    size="md"
                    leftIcon={renderLeftIcon(key)}
                    typographyFont="bodySemiBold"
                    textStyle={isWebsite ? styles.buttonText : undefined}
                    bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.WHITE}
                    textColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_600}
                    selfAlign="center">
                    {isWebsite ? LL.COMMON_WEBSITE() : null}
                </BaseButton>
            )
        },
        [filteredLinks.length, styles.button, styles.buttonText, renderLeftIcon, theme.isDark, LL, onNavigate],
    )

    if (filteredLinks.length === 0) return null

    return (
        <BaseView flexDirection="row" alignItems="center" gap={16} my={12}>
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
            minWidth: 72,
        },

        buttonText: {
            marginLeft: 12,
        },
    })
