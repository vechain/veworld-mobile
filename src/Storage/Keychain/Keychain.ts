import {
    ACCESSIBLE,
    getInternetCredentials,
    Options,
    resetInternetCredentials,
    setInternetCredentials,
} from "react-native-keychain"
import { debug } from "~Utils"
import * as i18n from "~i18n"

type Set = {
    key: string
    value: string
    options?: Options
}

export async function set({ key, value, options = {} }: Set) {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].BIOMETRICS_PROMPT_UNLOCK()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()

    options.accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    options.service = key
    options.authenticationPrompt = { title, cancel }

    debug("KeyChain - SET:", key, options)

    const res = await setInternetCredentials(key, key, value, options)

    if (res === false) {
        throw new Error("Failed to set keychain")
    }

    return res
}

type Get = {
    key: string
    options?: Options
}

export async function get({ key, options = {} }: Get): Promise<string | null> {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].BIOMETRICS_PROMPT_UNLOCK()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()
    options.accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    options.service = key
    options.authenticationPrompt = { title, cancel }

    debug("KeyChain - GET:", key, options)

    const res = await getInternetCredentials(key, options)

    if (res === false) {
        return null
    }

    return res.password
}

type Delete = {
    key: string
    options?: Options
}

export async function deleteItem({ key, options = {} }: Delete) {
    options.accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    options.service = key

    debug("KeyChain - DELETE:", key, options)
    return resetInternetCredentials(key, options)
}
