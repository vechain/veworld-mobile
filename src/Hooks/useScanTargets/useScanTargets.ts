import { useCallback } from "react"
import { ScanTarget } from "~Constants"
import { Routes } from "~Navigation"
import { AddressUtils, URIUtils, WalletConnectUtils } from "~Utils"
import { ScanFunctionRegistry } from "./types"
import { useAddressScanTarget } from "./useAddressScanTarget"
import { useUriScanTarget } from "./useUriScanTarget"
import { useVnsScanTarget } from "./useVnsScanTarget"
import { useWalletConnectScanTarget } from "./useWalletConnectScanTarget"

export type UseScanTargetArgs = {
    /**
     * List of targets that should be scanned
     */
    targets: ScanTarget[]
    /**
     * Overrides for the default functions. For VNS it's mandatory to have the fn, otherwise it won't do anything.
     */
    overrides?: Partial<ScanFunctionRegistry>
    /**
     * Current screen. Used only if `targets` include `ScanTarget.HTTPS_URL`
     */
    sourceScreen?: Routes
}

/**
 * Build the function to pas to SendReceiveBottomSheet
 * @param param0 options
 * @returns Function to pass to SendReceiveBottomSheet
 */
export const useScanTargets = ({ targets, overrides = {}, sourceScreen }: UseScanTargetArgs) => {
    const onVnsScan = useVnsScanTarget()
    const onAddressScan = useAddressScanTarget()
    const onWcScan = useWalletConnectScanTarget()
    const onUriScan = useUriScanTarget({ sourceScreen })
    return useCallback(
        async (data: string) => {
            const isAddressTarget = targets.includes(ScanTarget.ADDRESS)
            const isWalletConnectTarget = targets.includes(ScanTarget.WALLET_CONNECT)
            const isVnsTarget = targets.includes(ScanTarget.VNS)
            const isUrlTarget = targets.includes(ScanTarget.HTTPS_URL)

            if (isVnsTarget && data.endsWith(".vet")) {
                //Only call override for VNS
                if (overrides[ScanTarget.VNS]) return overrides[ScanTarget.VNS](data, onVnsScan)
            }

            //Make sure the address is clean, without any vechain: prefix
            const cleanedAddress = AddressUtils.coinbaseQRcodeAddress(data)

            const isValidAddress = isAddressTarget && AddressUtils.isValid(cleanedAddress)
            const isValidWalletConnectUri = isWalletConnectTarget && WalletConnectUtils.validateUri(data).isValid
            const isValidHttpsUrl = isUrlTarget && URIUtils.isValid(data) && URIUtils.isHttps(data)

            if (isAddressTarget && isValidAddress) {
                if (overrides[ScanTarget.ADDRESS]) return overrides[ScanTarget.ADDRESS](cleanedAddress, onAddressScan)
                onAddressScan(cleanedAddress)
                return true
            }
            if (isWalletConnectTarget && isValidWalletConnectUri) {
                if (overrides[ScanTarget.WALLET_CONNECT]) return overrides[ScanTarget.WALLET_CONNECT](data, onWcScan)
                onWcScan(data)
                return true
            }
            if (isUrlTarget && isValidHttpsUrl) {
                if (overrides[ScanTarget.HTTPS_URL]) return overrides[ScanTarget.HTTPS_URL](cleanedAddress, onUriScan)
                onUriScan(data)
                return true
            }
            return false
        },
        [onAddressScan, onUriScan, onVnsScan, onWcScan, overrides, targets],
    )
}
