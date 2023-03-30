import { useCallback, useEffect, useMemo, useState } from "react"
import { useOnDigitPress } from "~Screens/LockScreen/useOnDigitPress"

export const useOnDigitPressWithConfirmation = ({
    digitNumber,
    onFinishCallback,
    onConfirmationError,
}: {
    digitNumber: number
    onFinishCallback: (password: string) => void
    onConfirmationError?: () => void
}) => {
    const { pin, onDigitDelete, onDigitPress, setPin } = useOnDigitPress({
        digitNumber,
        resetPinOnFinishTimer: undefined,
    })

    const {
        pin: confirmationPin,
        setPin: setConfirmationPin,
        onDigitDelete: onConfirmationDigitDelete,
        onDigitPress: onConfirmationDigitPress,
    } = useOnDigitPress({
        digitNumber,
        resetPinOnFinishTimer: 300,
        onFinishCallback: onConfirmationFinish,
    })

    function onConfirmationFinish(finishedConfirmationPin: string) {
        if (finishedConfirmationPin === pin.join(""))
            onFinishCallback(finishedConfirmationPin)
        else {
            onConfirmationError && onConfirmationError()
            setTimeout(() => {
                setPin([])
                setConfirmationPin([])
            }, 300)
        }
    }

    const [isConfirmationPin, setIsConfirmationPin] = useState<boolean>(false)

    /**
     * Calculate if we have to show the confirmation pin or not based on the pin length
     * This is delayed 300ms in order to avoid the flickering of the pin
     */
    useEffect(() => {
        const isConfirmation = pin.length === digitNumber
        const timeout = setTimeout(() => {
            setIsConfirmationPin(isConfirmation)
        }, 300)
        return () => clearTimeout(timeout)
    }, [pin, digitNumber])

    const isPinRetype = useMemo(() => {
        return pin.length === digitNumber && confirmationPin.length === 0
    }, [pin, confirmationPin, digitNumber])

    const onDigitWithConfirmationPress = useCallback(
        (digit: string) => {
            if (isConfirmationPin) onConfirmationDigitPress(digit)
            else onDigitPress(digit)
        },
        [isConfirmationPin, onConfirmationDigitPress, onDigitPress],
    )

    const onDigitWithConfirmationDelete = useCallback(() => {
        if (isConfirmationPin) onConfirmationDigitDelete()
        else onDigitDelete()
    }, [isConfirmationPin, onConfirmationDigitDelete, onDigitDelete])

    return {
        onDigitPress: onDigitWithConfirmationPress,
        onDigitDelete: onDigitWithConfirmationDelete,
        pin: isConfirmationPin ? confirmationPin : pin,
        isPinRetype,
    }
}
