import {
    ACCESSIBLE,
    getInternetCredentials,
    resetInternetCredentials,
    setInternetCredentials,
    type SetOptions,
    type GetOptions,
    type BaseOptions,
} from "react-native-keychain"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import * as i18n from "~i18n"

type Set = {
    key: string
    value: string
    isCloudSync?: boolean
    options?: SetOptions
}

export async function set({ key, value, isCloudSync = false, options = {} }: Set) {
    const locale = i18n.detectLocale()
    let title = isCloudSync
        ? i18n.i18n()[locale].BD_BACKUP_PASSWORD_TO_KEYCHAIN()
        : i18n.i18n()[locale].BIOMETRICS_PROMPT_UNLOCK()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()

    const setOptions: SetOptions = {
        ...options,
        accessible: isCloudSync ? ACCESSIBLE.WHEN_UNLOCKED : ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        service: key,
        authenticationPrompt: { title, cancel },
    }

    debug(ERROR_EVENTS.ENCRYPTION, "KeyChain - SET:", key, setOptions)

    const res = await setInternetCredentials(key, key, value, setOptions)

    if (res === false) {
        throw new Error("Failed to set keychain")
    }

    return res
}

type Get = {
    key: string
    options?: GetOptions
    isCloudSync?: boolean
}

export async function get({ key, isCloudSync = false, options = {} }: Get): Promise<string | null> {
    const locale = i18n.detectLocale()
    let title = isCloudSync
        ? i18n.i18n()[locale].BD_BACKUP_PASSWORD_TO_KEYCHAIN()
        : i18n.i18n()[locale].BIOMETRICS_PROMPT_UNLOCK()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()

    const getOptions: GetOptions = {
        ...options,
        service: key,
        authenticationPrompt: { title, cancel },
    }

    debug(ERROR_EVENTS.ENCRYPTION, "KeyChain - GET:", key, getOptions)

    const res = await getInternetCredentials(key, getOptions)

    if (res === false) {
        return null
    }

    return res.password
}

type Delete = {
    key: string
    options?: BaseOptions
}

export async function deleteItem({ key, options = {} }: Delete) {
    const deleteOptions: BaseOptions = {
        ...options,
        service: key,
    }

    debug(ERROR_EVENTS.ENCRYPTION, "KeyChain - DELETE:", key, deleteOptions)
    return resetInternetCredentials(deleteOptions)
}
