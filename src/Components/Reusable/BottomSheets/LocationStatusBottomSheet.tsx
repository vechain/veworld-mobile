import React, { useCallback, useEffect } from "react"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal } from "~Hooks"
import DeviceInfo from "react-native-device-info"
import RNAndroidLocationEnabler from "react-native-android-location-enabler"
import { Linking } from "react-native"

const snapPoints = ["55%"]

/**
 * Bottom sheet that shows when location is not enabled or authorized
 **/
export const LocationStatusBottomSheet: React.FC = () => {
    const { LL } = useI18nContext()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    // WORKAROUND: I need to do this in a setTimeout because of a bottomsheet bug that makes it reopen
    // https://github.com/gorhom/react-native-bottom-sheet/issues/191
    // https://github.com/gorhom/react-native-bottom-sheet/issues/204
    useEffect(() => {
        const timer = setTimeout(() => {
            DeviceInfo.isLocationEnabled().then(enabled => {
                if (enabled) {
                    onClose()
                } else {
                    onOpen()
                }
            })
        }, 100)
        return () => clearTimeout(timer)
    }, [onOpen, onClose])

    const handleOnPress = useCallback(() => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
            interval: 10000,
            fastInterval: 5000,
        })
            .then(() => {
                // The user has accepted to enable the location services
                // (data) =>  can be :
                //  - "already-enabled" if the location services has been already enabled
                //  - "enabled" if user has clicked on OK button in the popup
                onClose()
            })
            .catch(err => {
                // The user has not accepted to enable the location services or something went wrong during the process
                // "err" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
                // codes :
                //  - ERR00 : The user has clicked on Cancel button in the popup
                //  - ERR01 : If the Settings change are unavailable
                //  - ERR02 : If the popup has failed to open
                //  - ERR03 : Internal error
                if (err.includes(["ERR01", "ERR02", "ERR03"])) {
                    Linking.openSettings()
                    onClose()
                }
            })
    }, [onClose])

    return (
        <BaseBottomSheet
            enablePanDownToClose={false}
            snapPoints={snapPoints}
            ref={ref}>
            <BaseView
                h={100}
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="subTitleBold">
                        {LL.ALERT_TITLE_ENABLE_LOCATION()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body" my={8}>
                        {LL.ALERT_MSG_ENABLE_LOCATION()}
                    </BaseText>
                </BaseView>

                <BaseView
                    flexDirection="row"
                    justifyContent="space-between"
                    w={100}
                    alignItems="center">
                    <BaseView alignItems="center" w={100}>
                        <BaseButton
                            variant="solid"
                            action={handleOnPress}
                            w={100}
                            my={10}
                            title={LL.BTN_ENABLE()}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
}
