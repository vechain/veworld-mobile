import React, { useCallback, useEffect } from "react"
import { Linking } from "react-native"
import DeviceInfo from "react-native-device-info"
import { getCountry } from "react-native-localize"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useCheckAppVersion } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import {
    VersionUpdateSlice,
    useAppDispatch,
    selectAdvisedAppVersion,
    useAppSelector,
    selectUpdateDismissCount,
} from "~Storage/Redux"

export const VersionUpdateAvailableBottomSheet = () => {
    const { LL } = useI18nContext()
    const countryCode = getCountry()?.toLowerCase()
    const dispatch = useAppDispatch()
    const advisedVersion = useAppSelector(state => selectAdvisedAppVersion(state))
    const dismissCount = useAppSelector(state => selectUpdateDismissCount(state))
    const { shouldShowUpdatePrompt } = useCheckAppVersion()
    const { ref, onOpen, onClose } = useBottomSheetModal()

    const APPLE_STORE_URL = `https://apps.apple.com/${countryCode}/app/veworld/id6446854569`
    const GOOGLE_STORE_URL = "https://play.google.com/store/apps/details?id=org.vechain.veworld.app"

    const track = useAnalyticTracking()

    useEffect(() => {
        if (shouldShowUpdatePrompt) {
            track(AnalyticsEvent.VERSION_UPGRADE_MODAL_OPENED, {
                currentVersion: DeviceInfo.getVersion(),
                advisedVersion: advisedVersion,
                count: dismissCount + 1,
            })
            onOpen()
        }
    }, [shouldShowUpdatePrompt, advisedVersion, track, onOpen, dismissCount])

    const handleUpdateApp = useCallback(async () => {
        track(AnalyticsEvent.VERSION_UPGRADE_MODAL_SUCCESS, {
            advisedVersion: advisedVersion,
            requestCount: dismissCount,
        })
        onClose()
        Linking.openURL(PlatformUtils.isIOS() ? APPLE_STORE_URL : GOOGLE_STORE_URL)
    }, [track, advisedVersion, dismissCount, onClose, APPLE_STORE_URL])

    const handleUpdateLater = useCallback(async () => {
        dispatch(VersionUpdateSlice.actions.incrementDismissCount())
        track(AnalyticsEvent.VERSION_UPGRADE_MODAL_DISMISSED, {
            advisedVersion: advisedVersion,
            requestCount: dismissCount,
        })
        onClose()
    }, [advisedVersion, dismissCount, dispatch, onClose, track])

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
            ref={ref}
            title={LL.UPDATE_VERSION_AVAILABLE()}
            description={LL.UPDATE_VERSION_AVAILABLE_MESSAGE({
                version: advisedVersion,
            })}
            mainButton={mainButton}
            secondaryButton={secondaryButton}
            enablePanDownToClose={false}
            icon="icon-mobile"
            iconSize={40}
        />
    )
}
