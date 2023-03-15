import { useCallback } from "react"
import { SettingsConstants } from "~Common/Constant"
import { CryptoUtils } from "~Common/Utils"
import { getConfig, useRealm } from "~Storage"

export const usePasswordValidation = () => {
    const { store } = useRealm()

    const validatePassword = useCallback(
        async (userPassword: string[]) => {
            try {
                const config = getConfig(store)

                const pinValidationString = config.pinValidationString
                let decryptedString = CryptoUtils.decrypt<string>(
                    pinValidationString,
                    userPassword.join(""),
                )

                return decryptedString === SettingsConstants.VALIDATION_STRING
            } catch (error) {
                return false
            }
        },

        [store],
    )

    return validatePassword
}
