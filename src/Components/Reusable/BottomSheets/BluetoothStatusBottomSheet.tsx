import React, { useCallback, useEffect, useMemo } from "react"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useBluetoothStatus, useBottomSheetModal } from "~Common"
import { Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { PlatformUtils } from "~Utils"

const snapPoints = ["55%"]

/**
 * Bottom sheet that shows when bluetooth is not enabled or authorized
 * This bottomsheet is different than the others because it automatically manage its lifecycle based on ble status
 * You just need to render it with no params and it will show up when needed
 **/
export const BluetoothStatusBottomSheet: React.FC = () => {
    const { LL } = useI18nContext()

    const { ref, onOpen, onClose } = useBottomSheetModal()
    const nav = useNavigation()

    const { status, isAuthorized, isEnabled, isUnsupported } =
        useBluetoothStatus()

    const content = useMemo(() => {
        if (!isAuthorized) {
            return {
                title: LL.ALERT_TITLE_AUTHORIZE_BLUETOOTH(),
                desc: LL.ALERT_MSG_AUTHORIZE_BLUETOOTH(),
            }
        }
        if (!isEnabled) {
            return {
                title: LL.ALERT_TITLE_ENABLE_BLUETOOTH(),
                desc: LL.ALERT_MSG_ENABLE_BLUETOOTH(),
            }
        }
        if (isUnsupported) {
            return {
                title: LL.ALERT_TITLE_UNSUPPORTED_BLUETOOTH(),
                desc: LL.ALERT_MSG_UNSUPPORTED_BLUETOOTH(),
            }
        }
        return { title: "", desc: "" }
    }, [LL, isAuthorized, isEnabled, isUnsupported])

    // WORKAROUND: I need to do this in a setTimeout because of a bottomsheet bug that makes it reopen
    // https://github.com/gorhom/react-native-bottom-sheet/issues/191
    // https://github.com/gorhom/react-native-bottom-sheet/issues/204
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isUnsupported || !isAuthorized || !isEnabled) {
                onOpen()
            } else {
                onClose()
            }
        }, 100)
        return () => clearTimeout(timer)
    }, [isUnsupported, isAuthorized, isEnabled, status, onOpen, onClose])

    const handleOnPress = useCallback(() => {
        if (!isAuthorized) {
            Linking.openSettings()
            //TODO: Go to BLE settings
        } else if (!isEnabled) {
            PlatformUtils.isIOS()
                ? Linking.openURL("App-Prefs:Bluetooth")
                : Linking.sendIntent("android.settings.BLUETOOTH_SETTINGS")
        } else if (isUnsupported) {
            nav.goBack()
        }
    }, [isAuthorized, isEnabled, isUnsupported, nav])

    const btnText = useMemo(() => {
        if (!isAuthorized || !isEnabled) {
            return LL.BTN_GO_TO_SETTINGS()
        }
        if (isUnsupported) {
            return LL.BTN_GO_BACK()
        }
        return ""
    }, [LL, isAuthorized, isEnabled, isUnsupported])

    return (
        //TODO: Pass prop to disable close on touch outside when available
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
                        {content.title}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body" my={8}>
                        {content.desc}
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
                            title={btnText.toUpperCase()}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
}
