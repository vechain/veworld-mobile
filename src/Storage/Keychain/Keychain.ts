import {
    ACCESSIBLE,
    getInternetCredentials,
    Options,
    resetInternetCredentials,
    setInternetCredentials,
} from "react-native-keychain"
import { debug } from "~Utils"

type Set = {
    key: string
    value: string
    options?: Options
}

export async function set({ key, value, options = {} }: Set) {
    options.accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    options.service = key

    debug("KeyChain - SET:", key, options)

    await setInternetCredentials(key, key, value, options)
}

type Get = {
    key: string
    options?: Options
}

export async function get({ key, options = {} }: Get): Promise<string | null> {
    options.accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    options.service = key

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
