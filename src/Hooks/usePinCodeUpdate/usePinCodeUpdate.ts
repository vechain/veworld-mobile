import { useCallback } from "react"
import { error } from "~Utils"

export const usePinCodeUpdate = () => {
    const updatePinCode = useCallback((pinCode: string) => {
        error("Not updating pin code yet", pinCode)
        throw new Error("Not updating pin code yet")
    }, [])

    return {
        updatePinCode,
    }
}
