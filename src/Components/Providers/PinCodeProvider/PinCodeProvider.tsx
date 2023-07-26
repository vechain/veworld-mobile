import React, { useCallback, useEffect, useMemo } from "react"
import {
    selectIsPinCodeRequired,
    selectUserSelectedSecurity,
    setAppLockStatus,
    setIsPinCodeRequired,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { SecurityLevelType, WALLET_STATUS } from "~Model"
import { CryptoUtils, HexUtils, warn } from "~Utils"

const PinCodeContext = React.createContext<{
    removePinCode: () => void
    updatePinCode: (pin: string) => void
    enablePinCodeStorage: (pin: string) => void
    getPinCode: () => string | undefined
    isPinRequired: boolean
}>({
    isPinRequired: true,
    enablePinCodeStorage: () => {},
    removePinCode: () => {},
    updatePinCode: () => {},
    getPinCode: () => undefined,
})

type PinCodeContextProviderProps = { children: React.ReactNode }

type PinCodeData = {
    pinCode: string
}

/**
 * A provider that allows to store the pin code for the duration of the app session.
 * The pin code is removed when the app is closed
 */
export const PinCodeProvider = ({ children }: PinCodeContextProviderProps) => {
    /**
     * Generate a new random encryption key for every session
     */
    const encryptionKey = useMemo(() => HexUtils.generateRandom(256), [])

    const isPinCodeRequired = useAppSelector(selectIsPinCodeRequired)
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)
    const dispatch = useAppDispatch()

    const [encryptedPinCode, setEncryptedPinCode] = React.useState<
        string | undefined
    >()

    // Reset pin code when the user changes the security setting to pin required
    useEffect(() => {
        if (isPinCodeRequired) {
            setEncryptedPinCode(undefined)
        }
    }, [encryptionKey, isPinCodeRequired])

    const updatePinCode = useCallback(
        (unencryptedPin: string) => {
            const data: PinCodeData = {
                pinCode: unencryptedPin,
            }

            const encryptedData = CryptoUtils.encrypt(data, encryptionKey)

            setEncryptedPinCode(encryptedData)
        },
        [encryptionKey],
    )

    const enablePinCodeStorage = useCallback(
        (pin: string) => {
            dispatch(setIsPinCodeRequired(false))
            dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))

            updatePinCode(pin)
        },
        [updatePinCode, dispatch],
    )

    const pinCodeStorageEnabled = useMemo(
        () =>
            !isPinCodeRequired &&
            userSelectedSecurity === SecurityLevelType.SECRET,
        [isPinCodeRequired, userSelectedSecurity],
    )

    const getPinCode = useCallback(() => {
        if (!pinCodeStorageEnabled) {
            warn("getPinCode: Pin code storage disabled")
            return
        }

        if (!encryptedPinCode) return

        const decrypted = CryptoUtils.decrypt<PinCodeData>(
            encryptedPinCode,
            encryptionKey,
        )

        return decrypted.pinCode
    }, [encryptionKey, encryptedPinCode, pinCodeStorageEnabled])

    const removePinCode = useCallback(() => {
        setEncryptedPinCode(undefined)
    }, [])

    const value = useMemo(() => {
        return {
            removePinCode,
            updatePinCode,
            getPinCode,
            enablePinCodeStorage,
            isPinRequired: isPinCodeRequired,
        }
    }, [
        updatePinCode,
        enablePinCodeStorage,
        getPinCode,
        isPinCodeRequired,
        removePinCode,
    ])

    return (
        <PinCodeContext.Provider value={value}>
            {children}
        </PinCodeContext.Provider>
    )
}

export const usePinCode = () => {
    const context = React.useContext(PinCodeContext)
    if (!context) {
        throw new Error("usePinCode must be used within a PinCodeContext")
    }

    return context
}
