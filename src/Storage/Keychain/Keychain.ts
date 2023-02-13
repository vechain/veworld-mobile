import * as SecureStore from "expo-secure-store"
import * as i18n from "~i18n"

const WALLET_KEY = "VeWorld_Wallet_key"

export async function set(
    encKey: string,
    deviceIndex: number,
    accessControl?: boolean,
) {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
        }
    }

    await SecureStore.setItemAsync(
        `${WALLET_KEY}_${deviceIndex}`,
        encKey,
        options,
    )
}

export async function get(
    deviceIndex: number,
    accessControl?: boolean,
): Promise<string | null> {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
        }
    }

    return await SecureStore.getItemAsync(
        `${WALLET_KEY}_${deviceIndex}`,
        options,
    )
}
