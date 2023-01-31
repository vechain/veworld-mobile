import * as SecureStore from "expo-secure-store"
import * as i18n from "~i18n"

// const WALLET_KEY = "VeWorld_Wallet_key"
// const REALM_KEY = "VeWorld_Realm_key"

export async function set(encKey: string, accessControl: boolean) {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    console.log(`Set on Keychain with access control set to : ${accessControl}`)

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

    console.log(
        `Get from Keychain with access control set to : ${accessControl}`,
    )

    let options = {
        requireAuthentication: accessControl,
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: "VeWorld_Wallet_key",
        authenticationPrompt: promptTitle.toString(),
    }

    return await SecureStore.getItemAsync("VeWorld_Wallet_key", options)
}

export async function remove() {
    let res = await SecureStore.deleteItemAsync("VeWorld_Wallet_key")
    console.log("KEYCHAIN DELETE OLD ENCRYPTION KEY : ", res)
}
