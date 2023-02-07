import { useCallback, useEffect, useState } from "react"
import produce from "immer"
import KeychainService from "~Services/KeychainService"
import { CryptoUtils, PasswordUtils } from "~Common"

export const useOnDigitPress = () => {
    const [isPinError, setIsPinError] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [userPin, setUserPin] = useState("")
    const [validatePIN, setValidatePIN] = useState(false)
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

        // set user PIN (logic)
        setUserPin(prevState => prevState.concat(digit))

        // set user PIN (UI)
        setUserPinArray(
            produce(draft => {
                if (digit === "*") {
                    const newIndex = index - 1
                    draft[newIndex] = undefined
                } else {
                    draft[index] = digit
                }

                if (!draft.includes(undefined)) {
                    setValidatePIN(true)
                }
            }),
        )
    }

    const _validatePIN = useCallback(async () => {
        try {
            let encryptedKey = await KeychainService.getEncryptionKey(false)
            console.log("encryptedKey", encryptedKey)
            if (encryptedKey) {
                const hashedKey = PasswordUtils.hash(userPin)
                let ket = CryptoUtils.decrypt<string>(encryptedKey, hashedKey)
                console.log("ket", ket)
                setIsSuccess(true)
            }
        } catch (error) {
            console.log("EROR:........", error)
            setIsPinError(true)
            setUserPinArray(Array.from({ length: 6 }))
        }
    }, [userPin]) // remove dep

    useEffect(() => {
        validatePIN && _validatePIN()
    }, [_validatePIN, validatePIN])

    return {
        onDigitPress,
        userPinArray,
        isSuccess,
        isPinError,
        userPin,
    }
}
