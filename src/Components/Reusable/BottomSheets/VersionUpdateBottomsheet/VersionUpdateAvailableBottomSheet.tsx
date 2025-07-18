import React, { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import DeviceInfo from "react-native-device-info"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { AnalyticsEvent, APPLE_STORE_URL, GOOGLE_STORE_URL } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useCheckAppVersion } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import {
    useAppDispatch,
    selectBreakingAppVersion,
    useAppSelector,
    selectUpdateDismissCount,
    incrementDismissCount,
    selectLatestAppVersion,
} from "~Storage/Redux"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils.ts"

export const VersionUpdateAvailableBottomSheet = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const majorVersion = useAppSelector(selectBreakingAppVersion)
    const latestVersion = useAppSelector(selectLatestAppVersion)
    const dismissCount = useAppSelector(selectUpdateDismissCount)
    const { shouldShowUpdatePrompt } = useCheckAppVersion()
    const { ref, onOpen, onClose } = useBottomSheetModal()

    const track = useAnalyticTracking()

    useEffect(() => {
        if (shouldShowUpdatePrompt) {
            track(AnalyticsEvent.VERSION_UPGRADE_MODAL_OPENED, {
                platform: isIOS() ? "iOS" : "Android",
                currentVersion: DeviceInfo.getVersion(),
                majorVersion: majorVersion,
                latestVersion: latestVersion,
                count: dismissCount + 1,
            })
            onOpen()
        }
        return () => {
            onClose()
        }
    }, [shouldShowUpdatePrompt, majorVersion, latestVersion, track, onOpen, onClose, dismissCount])

    const handleUpdateApp = useCallback(async () => {
        track(AnalyticsEvent.VERSION_UPGRADE_MODAL_SUCCESS, {
            platform: isIOS() ? "iOS" : "Android",
            majorVersion: majorVersion,
            latestVersion: latestVersion,
            requestCount: dismissCount,
        })
        onClose()
        await Linking.openURL(PlatformUtils.isIOS() ? APPLE_STORE_URL : GOOGLE_STORE_URL)
    }, [track, majorVersion, latestVersion, dismissCount, onClose])

    const handleUpdateLater = useCallback(() => {
        dispatch(incrementDismissCount())
        track(AnalyticsEvent.VERSION_UPGRADE_MODAL_DISMISSED, {
            platform: isIOS() ? "iOS" : "Android",
            majorVersion: majorVersion,
            latestVersion: latestVersion,
            requestCount: dismissCount,
        })
        onClose()
    }, [majorVersion, latestVersion, dismissCount, dispatch, onClose, track])

    const mainButton = (
        <BaseButton
            testID="Update_Now_Button"
            accessible
            variant="solid"
            size="lg"
            haptics="Medium"
            w={100}
            title={LL.ALERT_OPTION_UPDATE_NOW()}
            action={handleUpdateApp}
            activeOpacity={0.94}
        />
    )

    const secondaryButton = (
        <BaseButton
            testID="Update_Later_Button"
            accessible
            variant="outline"
            size="lg"
            haptics="Medium"
            w={100}
            title={LL.BTN_ILL_DO_IT_LATER()}
            action={handleUpdateLater}
            activeOpacity={0.94}
        />
    )

    return (
        <DefaultBottomSheet
            testId={"VersionUpdateAvailableBottomSheet"}
            ref={ref}
            title={LL.APP_UPDATE_AVAILABLE()}
            description={LL.APP_UPDATE_AVAILABLE_MESSAGE({
                version: latestVersion,
            })}
            mainButton={mainButton}
            secondaryButton={secondaryButton}
            icon="icon-mobile"
            iconSize={40}
        />
    )
}
