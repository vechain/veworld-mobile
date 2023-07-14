import React, { useCallback } from "react"
import {
    BackButtonHeader,
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
import { info } from "~Utils"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"
import {
    selectSentryTrackingEnabled,
    setSentryTrackingEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const AdvancedScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const onDownloadLogs = useCallback(() => {
        // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/756) implement download logs
        info("Download logs")
    }, [])

    const sentryTrackingEnabled = useAppSelector(selectSentryTrackingEnabled)
    const toggleSentryTrackingSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setSentryTrackingEnabled(newValue))
        },
        [dispatch],
    )

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />

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
                    onValueChange={toggleSentryTrackingSwitch}
                    value={sentryTrackingEnabled}
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
