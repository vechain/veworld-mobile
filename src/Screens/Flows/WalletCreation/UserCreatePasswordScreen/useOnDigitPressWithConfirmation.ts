import { useCallback, useMemo } from "react"
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
    const { pin, onDigitDelete, onDigitPress } = useOnDigitPress({
        digitNumber,
        resetPinOnFinish: false,
    })

    const onConfirmationFinish = useCallback(
        (finishedConfirmationPin: string) => {
            if (finishedConfirmationPin === pin.join(""))
                onFinishCallback(finishedConfirmationPin)
            else {
                onConfirmationError && onConfirmationError()
            }
        },
        [pin, onFinishCallback, onConfirmationError],
    )

    const {
        pin: confirmationPin,
        onDigitDelete: onConfirmationDigitDelete,
        onDigitPress: onConfirmationDigitPress,
    } = useOnDigitPress({
        digitNumber,
        resetPinOnFinish: false,
        onFinishCallback: onConfirmationFinish,
    })

    const isConfirmationPin = useMemo(
        () => pin.length === digitNumber,
        [pin, digitNumber],
    )

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
