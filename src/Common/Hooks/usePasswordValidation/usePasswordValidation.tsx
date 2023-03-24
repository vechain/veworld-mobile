import { useCallback } from "react"
import { SettingsConstants } from "~Common/Constant"
import { CryptoUtils } from "~Common/Utils"
import { useAppSelector } from "~Storage/Redux"
import { selectPinValidationString } from "~Storage/Redux/Selectors"

export const usePasswordValidation = () => {
    const pinValidationString = useAppSelector(selectPinValidationString)

    const validatePassword = useCallback(
        async (userPassword: string[]) => {
            try {
                let decryptedString = CryptoUtils.decrypt<string>(
                    pinValidationString,
                    userPassword.join(""),
                )

                return decryptedString === SettingsConstants.VALIDATION_STRING
            } catch (error) {
                return false
            }
        },

        [pinValidationString],
    )

    return validatePassword
}
