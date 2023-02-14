import { useCallback, useEffect, useState } from "react"
import produce from "immer"
import { usePasswordValidation } from "~Common"

export const useOnDigitPress = () => {
    const [isPinError, setIsPinError] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [userPinArray, setUserPinArray] = useState<Array<string | undefined>>(
        Array.from({ length: 6 }),
    )

    const { validatePassword } = usePasswordValidation()

    const onDigitPress = (digit: string) => {
        // protect for ui overflow
        if (!userPinArray.includes(undefined)) {
            return
        }
        // remove error UI when user re-enters pin
        setIsPinError(false)
        // get index of array element to remove
        const index = userPinArray.findIndex(pin => pin === undefined)

        // set user PIN (UI)
        setUserPinArray(
            produce(draft => {
                if (digit === "*") {
                    const newIndex = index - 1
                    draft[newIndex] = undefined
                } else {
                    draft[index] = digit
                }
            }),
        )
    }

    const _validatePIN = useCallback(
        async (_userPinArray: string[]) => {
            let isValid = await validatePassword(_userPinArray)
            if (isValid) {
                setIsSuccess(!!isValid)
            } else {
                setIsPinError(true)
                setUserPinArray(Array.from({ length: 6 }))
            }
        },
        [validatePassword],
    )

    useEffect(() => {
        if (!userPinArray.includes(undefined)) {
            _validatePIN(userPinArray as string[])
        }
    }, [_validatePIN, userPinArray])

    return {
        onDigitPress,
        userPinArray,
        isSuccess,
        isPinError,
    }
}
