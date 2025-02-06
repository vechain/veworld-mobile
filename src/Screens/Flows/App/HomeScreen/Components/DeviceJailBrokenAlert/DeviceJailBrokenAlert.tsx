import React from "react"
import JailMonkey from "jail-monkey"
import { BaseIcon, BaseText, BaseView, WrapTranslation } from "~Components"
import { useThemedStyles } from "~Hooks"
import { StyleSheet, Text } from "react-native"
import { ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"

export const DeviceJailBrokenAlert = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    if (!JailMonkey.isJailBroken()) return <></>

    return (
        <BaseView
            p={8}
            pl={12}
            flexDirection="row"
            w={100}
            style={styles.container}
            alignItems="center"
            flexWrap="wrap"
            my={8}>
            <BaseIcon name="icon-shield-alert" size={18} color={theme.colors.errorVariant.title} />
            <BaseView flex={1}>
                <BaseText color={theme.colors.errorVariant.title} typographyFont="body">
                    <WrapTranslation
                        message={LL.ALERT_TITLE_JAILBROKEN_DEVICE_2()}
                        renderComponent={() => (
                            <Text style={styles.alertTitle}>{LL.ALERT_TITLE_JAILBROKEN_DEVICE_1()}</Text>
                        )}
                    />
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            gap: 12,
            borderWidth: 1,
            borderColor: theme.colors.errorVariant.border,
            borderRadius: 8,
            backgroundColor: theme.colors.errorVariant.background,
        },
        alertTitle: {
            fontSize: 14,
            fontWeight: "600",
            fontFamily: "Inter-SemiBold",
            color: theme.colors.errorVariant.title,
        },
    })
