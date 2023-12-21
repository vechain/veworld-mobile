import React, { useCallback } from "react"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import DeviceInfo from "react-native-device-info"
import { VeWorldLogoSVG } from "~Assets"
import { Linking } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import HapticsService from "~Services/HapticsService"
import { useTheme } from "~Hooks"

export const AboutScreen = () => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    const links = [
        {
            title: LL.SETTINGS_ABOUT_OFFICIAL_SITE(),
            subtitle: LL.SETTINGS_ABOUT_WEWORLD_WEBSITE(),
            url: "https://www.veworld.net/",
        },
        {
            title: LL.SETTINGS_ABOUT_GET_HELP(),
            subtitle: LL.SETTINGS_ABOUT_REPORT_BUG(),
            url: "https://support.veworld.com/support/tickets/new",
        },
        {
            title: LL.SETTINGS_ABOUT_OUR_COMMITMENT(),
            subtitle: LL.SETTINGS_ABOUT_PRIVACY_POLICY(),
            url: "https://www.veworld.net/privacy-policy",
        },
    ]

    const renderLinks = useCallback(
        (link: { title: LocalizedString; subtitle: LocalizedString; url: string }) => (
            <BaseView w={100} py={8} key={link.title + link.subtitle}>
                <BaseCard
                    key={link.url}
                    style={styles.itemCard}
                    onPress={() => {
                        HapticsService.triggerImpact({ level: "Light" })
                        Linking.openURL(link.url)
                    }}>
                    <BaseView flex={1} flexDirection="row" justifyContent="space-between" alignItems="center">
                        <BaseView>
                            <BaseText typographyFont="subTitleBold">{link.title}</BaseText>
                            <BaseSpacer height={8} />
                            <BaseText typographyFont="captionRegular">{link.subtitle}</BaseText>
                        </BaseView>
                        <BaseView>
                            <BaseIcon name="chevron-right" size={25} color={theme.colors.text} />
                        </BaseView>
                    </BaseView>
                </BaseCard>
            </BaseView>
        ),
        [theme.colors.text],
    )

    return (
        <Layout
            body={
                <>
                    <BaseText typographyFont="title" pt={16}>
                        {LL.TITLE_ABOUT()}
                    </BaseText>
                    <BaseView h={100} alignItems="center">
                        <BaseSpacer height={24} />
                        <BaseCard
                            containerStyle={styles.logoCardContainer}
                            // @ts-ignore
                            style={styles.logoCard}>
                            <VeWorldLogoSVG width={90} height={62} />
                        </BaseCard>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subTitleBold">{LL.VEWORLD()}</BaseText>
                        <BaseSpacer height={8} />
                        <BaseText typographyFont="captionRegular">
                            {LL.SETTINGS_ABOUT_APP_VERSION({
                                // NOTE: this can be taken from package.json too, but this seems more reliable
                                version: DeviceInfo.getVersion(),
                            })}
                        </BaseText>
                        <BaseSpacer height={48} />
                        {links.map(link => renderLinks(link))}
                    </BaseView>
                </>
            }
        />
    )
}

const styles = {
    logoCardContainer: {
        width: 110,
        height: 110,
        borderRadius: 24,
    },
    logoCard: {
        borderRadius: 24,
        width: 110,
        height: 110,
        alignItems: "center",
        justifyContent: "center",
    },
    itemCard: {
        padding: 16,
    },
}
