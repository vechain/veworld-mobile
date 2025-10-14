import { useCallback } from "react"
import { useCopyClipboard } from "~Hooks/useCopyClipboard"
import { useI18nContext } from "~i18n"

export const useAddressScanTarget = () => {
    const { LL } = useI18nContext()
    const { onCopyToClipboard } = useCopyClipboard()

    return useCallback(
        (data: string) => {
            return onCopyToClipboard(data, LL.COMMON_LBL_ADDRESS(), { icon: "icon-wallet" })
        },
        [LL, onCopyToClipboard],
    )
}
