import { useEffect, useState } from "react"
import { Barcode } from "vision-camera-code-scanner"
import { AddressUtils } from "~Common"

export const useConfirmAddress = (barcodes: Barcode[]) => {
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [address, setAddress] = useState("")

    useEffect(() => {
        if (
            (barcodes.length && barcodes[0]?.displayValue) ||
            barcodes[0]?.rawValue
        ) {
            const _address = barcodes[0].displayValue! || barcodes[0].rawValue!
            const isValidAddress = AddressUtils.isValid(address)
            setAddress(_address)
            setIsConfirmed(isValidAddress)
        }
    }, [address, barcodes])

    return { isConfirmed, address }
}
