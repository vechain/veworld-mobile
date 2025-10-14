import { useCallback } from "react"
import { useWalletConnect } from "~Components"
import { useCopyClipboard } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { AddressUtils, debug, URIUtils, WalletConnectUtils } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { useDAppActions } from "../../AppsScreen/Hooks"

export const useHomeQrScan = () => {
    const { LL } = useI18nContext()
    const { onCopyToClipboard } = useCopyClipboard()
    const { onPair } = useWalletConnect()
    const { onDAppPress } = useDAppActions(Routes.HOME)

    return useCallback(
        (qrData: string) => {
            if (WalletConnectUtils.validateUri(qrData).isValid) {
                HapticsService.triggerImpact({ level: "Light" })
                onPair(qrData)
            } else if (AddressUtils.isValid(qrData)) {
                onCopyToClipboard(qrData, LL.COMMON_LBL_ADDRESS(), { icon: "icon-wallet" })
            } else if (URIUtils.isValid(qrData) && URIUtils.isHttps(qrData)) {
                onDAppPress({
                    amountOfNavigations: 0,
                    createAt: Date.now(),
                    href: qrData,
                    isCustom: true,
                    name: qrData,
                })
            } else {
                debug(ERROR_EVENTS.APP, qrData)
            }
        },
        [LL, onCopyToClipboard, onDAppPress, onPair],
    )
}
