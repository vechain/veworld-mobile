import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import { ACCESSIBLE, getInternetCredentials } from "react-native-keychain"
import { ERROR_EVENTS } from "~Constants"
import { useWalletSecurity } from "~Hooks/useWalletSecurity"
import { Routes } from "~Navigation"
import { info } from "~Utils"

export const useSecurityUpgrade_V2 = () => {
    const nav = useNavigation()
    const { isWalletSecurityBiometrics } = useWalletSecurity()

    useEffect(() => {
        const init = async () => {
            const PIN_CODE_STORAGE = "ENCRYPTION_KEY_STORAGE_V2"
            const BIOMETRIC_KEY_STORAGE = "BIOMETRIC_KEY_STORAGE_V2"
            const WALLET_ENCRYPTION_KEY_STORAGE = "WALLET_ENCRYPTION_KEY_STORAGE_V2"
            const WALLET_BIOMETRIC_KEY_STORAGE = "WALLET_BIOMETRIC_KEY_STORAGE_V2"
            const biometricKeys = [BIOMETRIC_KEY_STORAGE, WALLET_BIOMETRIC_KEY_STORAGE]
            const pinKeys = [PIN_CODE_STORAGE, WALLET_ENCRYPTION_KEY_STORAGE]

            /*
                TODO-Vas: test if this is true on a real device
                We need a timeout because isWalletSecurityBiometrics is not immediately available 
                and it defaults to pin first even if the user has biometrics enabled.
            */
            setTimeout(async () => {
                // Look for old keys
                if (isWalletSecurityBiometrics) {
                    for (const key of biometricKeys) {
                        let options = { accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, service: key }
                        const creds = await getInternetCredentials(key, options)

                        if (!creds) {
                            info(ERROR_EVENTS.SECURITY, "Security key for biometrics not found - Upgrade required!")
                            nav.navigate(Routes.SECURITY_UPGRADE_V2)
                            return
                        }
                    }
                } else {
                    for (const key of pinKeys) {
                        let options = { accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, service: key }
                        const creds = await getInternetCredentials(key, options)

                        if (!creds) {
                            info(ERROR_EVENTS.SECURITY, "Security key for pin not found - Upgrade required!")
                            nav.navigate(Routes.SECURITY_UPGRADE_V2)
                            return
                        }
                    }
                }
            }, 300)
        }

        init()
    }, [isWalletSecurityBiometrics, nav])
}
