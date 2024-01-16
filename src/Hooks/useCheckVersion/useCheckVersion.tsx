import moment from "moment"
import { useCallback, useEffect } from "react"
import { Alert, Linking } from "react-native"
import DeviceInfo from "react-native-device-info"
import checkVersion from "react-native-store-version"
import { ERROR_EVENTS } from "~Constants"
import { selectLastVersionCheck, setLastVersionCheck, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { PlatformUtils, warn } from "~Utils"
import { useI18nContext } from "~i18n"
import { getCountry } from "react-native-localize"

export const useCheckVersion = () => {
    const { LL } = useI18nContext()
    const countryCode = getCountry()?.toLowerCase()

    const APPLE_STORE_URL = `https://apps.apple.com/${countryCode}/app/veworld/id6446854569`
    const GOOGLE_STORE_URL = "https://play.google.com/store/apps/details?id=org.vechain.veworld.app"
    const lastVersionCheck = useAppSelector(selectLastVersionCheck)
    // this will check for a new version every week
    const nextVersionCheckDate = moment(lastVersionCheck).add(1, "weeks")
    const isTimeForANewCheck = moment().isAfter(nextVersionCheckDate)
    const dispatch = useAppDispatch()

    const init = useCallback(async () => {
        if (isTimeForANewCheck) {
            dispatch(setLastVersionCheck(moment().toISOString()))
            if (countryCode) {
                try {
                    const check = await checkVersion({
                        version: DeviceInfo.getVersion(),
                        iosStoreURL: APPLE_STORE_URL,
                        androidStoreURL: GOOGLE_STORE_URL,
                        country: countryCode,
                    })

                    if (check.result === "new") {
                        Alert.alert(LL.ALERT_TITLE_NEW_VERSION(), LL.ALERT_MSG_NEW_VERSION({ version: check.remote }), [
                            {
                                text: LL.ALERT_OPTION_UPDATE_NOW(),
                                onPress: () => {
                                    Linking.openURL(PlatformUtils.isIOS() ? APPLE_STORE_URL : GOOGLE_STORE_URL)
                                },
                            },
                            {
                                text: LL.ALERT_OPTION_ASK_ME_LATER(),
                            },
                        ])
                    }
                } catch (e) {
                    warn(
                        ERROR_EVENTS.APP,
                        "useCheckVersion",
                        `regionCode = ${countryCode} and countryCode = ${countryCode}`,
                        e,
                    )
                }
            } else {
                warn(ERROR_EVENTS.APP, "useCheckVersion", "countryCode is undefined")
            }
        }
    }, [isTimeForANewCheck, dispatch, countryCode, APPLE_STORE_URL, LL])

    useEffect(() => {
        init()
    }, [init])
}
