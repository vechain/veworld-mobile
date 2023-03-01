import { useCallback } from "react"
import { SettingsConstants } from "~Common/Constant"
import { CryptoUtils } from "~Common/Utils"
import { Config, useRealm } from "~Storage"

export const usePasswordValidation = () => {
    const { store } = useRealm()

    const validatePassword = useCallback(
        async (userPassword: string[]) => {
            try {
                const config = store.objectForPrimaryKey<Config>(
                    Config.getName(),
                    Config.getPrimaryKey(),
                )

                const pinValidationString = config?.pinValidationString
                let decryptedString = CryptoUtils.decrypt<string>(
                    pinValidationString!,
                    userPassword.join(""),
                )

                if (decryptedString === SettingsConstants.VALIDATION_STRING) {
                    return true
                } else {
                    return false
                }
            } catch (error) {
                return false
            }
        },

        [store],
    )

    return validatePassword
}
