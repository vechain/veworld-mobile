import { useCallback, useState } from "react"
import { AddressUtils } from "~Common"
import { BarCodeScanningResult } from "expo-camera"

export const useConfirmAddress = () => {
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [address, setAddress] = useState("")

    const confirmAddress = useCallback((result: BarCodeScanningResult) => {
        const isValidAddress = AddressUtils.isValid(result.data)
        setAddress(result.data)
        setIsConfirmed(isValidAddress)
    }, [])

    return { isConfirmed, confirmAddress, address }
}
