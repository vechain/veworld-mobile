import { useState } from "react"

export const useOnDigitPress = ({
    digitNumber,
    onFinishCallback,
    resetPinOnFinish = true,
}: {
    digitNumber: number
    onFinishCallback?: (password: string) => void
    resetPinOnFinish?: boolean
}) => {
    const [pin, setPin] = useState<string[]>([])

    const onDigitDelete = () => {
        setPin(prev => {
            if (!prev.length) return prev

            const temp = [...prev]
            temp.pop()
            return temp
        })
    }

    const onDigitPress = (digit: string) => {
        // remove error UI when user re-enters pin

        const updatedPin = [...pin, digit]

        if (updatedPin.length > digitNumber) return

        setPin(updatedPin)

        if (updatedPin.length === digitNumber) {
            onFinishCallback && onFinishCallback(updatedPin.join(""))
            resetPinOnFinish && setPin([])
        }
    }

    return {
        pin,
        setPin,
        onDigitPress,
        onDigitDelete,
    }
}
