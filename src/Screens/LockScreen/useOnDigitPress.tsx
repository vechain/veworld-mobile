import { useEffect, useState } from "react"

export const useOnDigitPress = ({
    digitNumber,
    onFinishCallback,
    resetPinOnFinishTimer,
}: {
    digitNumber: number
    onFinishCallback?: (password: string) => void
    resetPinOnFinishTimer?: number
}) => {
    const [pin, setPin] = useState<string[]>([])

    useEffect(() => {
        return () => {
            setPin([])
        }
    }, [])

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
            if (resetPinOnFinishTimer) {
                setTimeout(() => {
                    setPin([])
                }, resetPinOnFinishTimer)
            }
        }
    }

    return {
        pin,
        setPin,
        onDigitPress,
        onDigitDelete,
    }
}
