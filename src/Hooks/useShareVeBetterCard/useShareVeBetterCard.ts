import { useCallback, useRef, useState } from "react"
import { Share, View } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import { ERROR_EVENTS } from "~Constants"
import { debug, ErrorMessageUtils } from "~Utils"
import { useI18nContext } from "~i18n"

export const useShareVeBetterCard = () => {
    const { LL } = useI18nContext()
    const cardRef = useRef<View>(null)
    const [isSharing, setIsSharing] = useState(false)

    const shareCard = useCallback(async () => {
        if (isSharing || !cardRef.current) {
            return
        }

        setIsSharing(true)
        let tempUri: string | null = null

        try {
            tempUri = await captureRef(cardRef, {
                format: "png",
                quality: 1,
                result: "tmpfile",
            })

            await Share.share({
                url: tempUri,
                message: LL.VBD_SHARE_CARD_MESSAGE(),
            })
        } catch (error) {
            const errorMessage = ErrorMessageUtils.getErrorMessage(error)
            if (!errorMessage.includes("User did not share")) {
                debug(ERROR_EVENTS.APP, `Failed to share VeBetterDAO card: ${errorMessage}`)
            }
        } finally {
            if (tempUri) {
                releaseCapture(tempUri)
            }
            setIsSharing(false)
        }
    }, [isSharing, LL, cardRef])

    return { cardRef, shareCard, isSharing }
}
