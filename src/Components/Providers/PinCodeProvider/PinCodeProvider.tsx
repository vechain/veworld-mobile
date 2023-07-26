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
import { warn } from "~Utils"

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

/**
 * A provider that allows to store the pin code for the duration of the app session.
 * The pin code is removed when the app is closed
 */
export const PinCodeProvider = ({ children }: PinCodeContextProviderProps) => {
    const [pinCode, setPinCode] = React.useState<string | undefined>()

    const isPinCodeRequired = useAppSelector(selectIsPinCodeRequired)
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)
    const dispatch = useAppDispatch()

    // Reset pin code when the user changes the security setting to pin required
    useEffect(() => {
        if (isPinCodeRequired) {
            setPinCode(undefined)
        }
    }, [isPinCodeRequired])

    const enablePinCodeStorage = useCallback(
        (pin: string) => {
            dispatch(setIsPinCodeRequired(false))
            dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
            setPinCode(pin)
        },
        [dispatch],
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

        return pinCode
    }, [pinCode, pinCodeStorageEnabled])

    const removePinCode = useCallback(() => {
        setPinCode(undefined)
    }, [])

    const value = {
        removePinCode,
        updatePinCode: setPinCode,
        getPinCode,
        enablePinCodeStorage,
        isPinRequired: isPinCodeRequired,
    }

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
