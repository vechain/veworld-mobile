import { useCallback } from "react"
import { useI18nContext } from "~i18n"
import * as Clipboard from "expo-clipboard"
import { debug } from "~Utils"
import HapticsService from "~Services/HapticsService"
import { ERROR_EVENTS } from "~Constants"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { Feedback } from "~Components/Providers/FeedbackProvider"
import { IconKey } from "~Model"

type CopyToClipboardOptions = {
    icon?: IconKey
    showNotification?: boolean
}

/**
 * `useCopyClipboard` is a custom React Hook that provides the ability to copy a string to the system clipboard.
 *
 * The hook uses the `expo-clipboard` package to handle the clipboard interaction, and also provides user feedback
 * via toast notifications on success or debug information on failure.
 *
 * @returns {Object} - An object with a single method: `onCopyToClipboard`.
 *
 * @example
 * const { onCopyToClipboard } = useCopyClipboard()
 * onCopyToClipboard('text to copy', 'label name')
 */
export const useCopyClipboard = () => {
    const { LL } = useI18nContext()

    const onCopyToClipboard = useCallback(
        (
            text: string,
            labelName: string,
            options: CopyToClipboardOptions = { icon: "icon-copy", showNotification: true },
        ) => {
            Clipboard.setStringAsync(text.toLowerCase())
                .then(async () => {
                    await HapticsService.triggerImpact({ level: "Light" })
                    if (options.showNotification) {
                        Feedback.show({
                            severity: FeedbackSeverity.INFO,
                            type: FeedbackType.ALERT,
                            message: LL.NOTIFICATION_COPIED_CLIPBOARD({
                                name: labelName,
                            }),
                            icon: options.icon,
                        })
                    }
                })
                .catch(error => {
                    debug(ERROR_EVENTS.APP, error)
                })
        },
        [LL],
    )

    return { onCopyToClipboard }
}
