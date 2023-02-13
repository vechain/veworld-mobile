import { useCallback, useEffect, useState } from "react"
import produce from "immer"
import KeychainService from "~Services/KeychainService"
import { CryptoUtils, PasswordUtils } from "~Common"

export const useOnDigitPress = () => {
    const [isPinError, setIsPinError] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [userPinArray, setUserPinArray] = useState<Array<string | undefined>>(
        Array.from({ length: 6 }),
    )

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

    const _validatePIN = useCallback(async (_userPinArray: string[]) => {
        try {
            let encryptedKey = await KeychainService.getEncryptionKey(false)
            if (encryptedKey) {
                const hashedKey = PasswordUtils.hash(_userPinArray.join(""))
                CryptoUtils.decrypt<string>(encryptedKey, hashedKey)
                setIsSuccess(true)
            }
        } catch (error) {
            setIsPinError(true)
            setUserPinArray(Array.from({ length: 6 }))
        }
    }, [])

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
