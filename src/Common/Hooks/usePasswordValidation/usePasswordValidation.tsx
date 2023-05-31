import { useCallback } from "react"
import { SettingsConstants } from "~Common/Constant"
import { error } from "~Common/Logger"
import { CryptoUtils } from "~Utils"
import {
    setPinValidationString,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectPinValidationString } from "~Storage/Redux/Selectors"

export const usePasswordValidation = () => {
    const dispatch = useAppDispatch()
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

    const updatePassword = useCallback(
        async (newPasword: string) => {
            const _pinValidationString = CryptoUtils.encrypt<string>(
                SettingsConstants.VALIDATION_STRING,
                newPasword,
            )

            dispatch(setPinValidationString(_pinValidationString))
        },
        [dispatch],
    )

    return { validatePassword, updatePassword }
}
