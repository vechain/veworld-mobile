import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    EnableFeature,
} from "~Components"
import { Reset } from "./Components/Reset"
import { useI18nContext } from "~i18n"
import { info, useTheme } from "~Common"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

export const AdvancedScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const onDownloadLogs = useCallback(() => {
        info("Download logs")
    }, [])

    const [isAnalytics, setIsAnalytics] = useState(true)
    const toggleTagSwitch = useCallback((newValue: boolean) => {
        setIsAnalytics(newValue)
    }, [])

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={12} />

            <BaseView mx={20}>
                <BaseText typographyFont="title">
                    {LL.TITLE_ADVANCED()}
                </BaseText>
                <BaseSpacer height={24} />

                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_STATE_LOGS()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_STATE_LOGS_DISCLAIMER()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseButton
                    style={baseStyles.btnWidth}
                    size="md"
                    radius={12}
                    action={onDownloadLogs}
                    title={LL.BTN_DOWNLOAD_LOGS()}
                    rightIcon={
                        <BaseIcon
                            name="tray-arrow-down"
                            size={20}
                            color={theme.colors.textReversed}
                            style={baseStyles.iconMargin}
                        />
                    }
                />

                <BaseSpacer height={24} />
                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_RESET()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_RESET_DISCLAIMER()}
                </BaseText>
                <BaseSpacer height={16} />
                <Reset />

                <BaseSpacer height={24} />
                <EnableFeature
                    title={LL.BD_HELP_IMPROVE()}
                    subtitle={LL.BD_HELP_IMPROVE_DISCLAIMER()}
                    onValueChange={toggleTagSwitch}
                    value={isAnalytics}
                />
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },

    btnWidth: {
        width: 172,
    },

    iconMargin: {
        marginHorizontal: 12,
    },
})
