import * as SecureStore from "expo-secure-store"
import * as i18n from "~i18n"

export async function set(encKey: string, accessControl: boolean) {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options = {
        requireAuthentication: accessControl,
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: "VeWorld_Wallet_key",
        authenticationPrompt: promptTitle.toString(),
    }

    await SecureStore.setItemAsync("VeWorld_Wallet_key", encKey, options)
}

export async function get(accessControl: boolean): Promise<string | null> {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options = {
        requireAuthentication: accessControl,
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: "VeWorld_Wallet_key",
        authenticationPrompt: promptTitle.toString(),
    }

    return await SecureStore.getItemAsync("VeWorld_Wallet_key", options)
}

export async function remove() {
    await SecureStore.deleteItemAsync("VeWorld_Wallet_key")
}
