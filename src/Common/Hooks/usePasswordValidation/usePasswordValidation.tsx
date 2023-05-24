import { useCallback } from "react"
import { SettingsConstants } from "~Common/Constant"
import { error } from "~Common/Logger"
import { CryptoUtils } from "~Utils"
import { useAppSelector } from "~Storage/Redux"
import { selectPinValidationString } from "~Storage/Redux/Selectors"

export const usePasswordValidation = () => {
    const pinValidationString = useAppSelector(selectPinValidationString)

    const validatePassword = useCallback(
        async (userPassword: string) => {
            try {
                let decryptedString = CryptoUtils.decrypt<string>(
                    pinValidationString,
                    userPassword,
                )

                return decryptedString === SettingsConstants.VALIDATION_STRING
            } catch (e) {
                error(e)
                return false
            }
        },

        [pinValidationString],
    )

    return validatePassword
}
