import * as Keychain from "react-native-keychain"
// import * as i18n from "~i18n"

export async function set<T>(key: string, data: T, accessControl: boolean) {
    let options = {
        accessControl: accessControl
            ? Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE
            : undefined,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // ios only
        service: `VeWorld_Wallet_${key}`,
    }

    if (typeof data === "string") {
        await Keychain.setGenericPassword(key, data, options)
    } else {
        let dataToString = JSON.stringify(data)
        await Keychain.setGenericPassword(key, dataToString, options)
    }
}

export async function get(
    key: string,
    accessControl: boolean,
): Promise<Keychain.UserCredentials | false> {
    // const locale = i18n.detectLocale()
    // 18n.i18n()[locale].ACCOUNT_account_update_fail

    let options = {
        accessControl: accessControl
            ? Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE
            : undefined,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // ios only
        service: `VeWorld_Wallet_${key}`,
        authenticationPrompt: {
            title: "Secure your wallet",
            description: "Secure your wallet now", // android only
            cancel: "Cancel", // android only
        },
    }

    return await Keychain.getGenericPassword(options)
}
