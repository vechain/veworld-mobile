import { Keychain } from "~Storage"
import { error } from "~Utils/Logger"
import { ACCESSIBLE, Options } from "react-native-keychain"
import * as i18n from "~i18n"

const deleteKey = async (key: string) => {
    const options: Options = {
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        service: key,
    }

    try {
        await Keychain.deleteItem({ options, key })
    } catch (err) {
        error("deleteKey", err)
    }
}

const getKey = async (key: string) => {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].BIOMETRICS_PROMPT_UNLOCK()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()

    const options: Options = {
        authenticationPrompt: { title, cancel },
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        service: key,
    }

    try {
        return await Keychain.get({ options, key })
    } catch (err) {
        error("getKey", err)
    }
}

const setKey = async (key: string, value: string) => {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].BIOMETRICS_PROMPT_UNLOCK()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()

    const options: Options = {
        authenticationPrompt: { title, cancel },
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        service: key,
    }

    try {
        await Keychain.set({ options, key, value })
    } catch (err) {
        error("setKey", err)
    }
}

export default {
    getKey,
    setKey,
    deleteKey,
}
