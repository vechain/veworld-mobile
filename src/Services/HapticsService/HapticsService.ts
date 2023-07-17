import * as Haptics from "expo-haptics"

/**
 *
 * @param level "Success" | "Warning" | "Error"
 * @info https://docs.expo.io/versions/latest/sdk/haptics/
 * @description Use for toasts, and on CTAs when it's the final step in a flow (ex: "Create Wallet")
 */
const triggerNotification = async ({
    level,
}: {
    level: "Success" | "Warning" | "Error"
}) => {
    const _level = Haptics.NotificationFeedbackType[level]
    await Haptics.notificationAsync(_level)
}

/**
 *
 * @param level "Light" | "Medium" | "Heavy"
 * @info https://docs.expo.io/versions/latest/sdk/haptics/
 * @description Use for every other user interaction (ex: "Tap"). Base level on the importance of the action. Avoid using heavy.
 */
const triggerImpact = async ({
    level,
}: {
    level: "Light" | "Medium" | "Heavy"
}) => {
    const _level = Haptics.ImpactFeedbackStyle[level]
    await Haptics.impactAsync(_level)
}

const triggerHaptics = async ({
    haptics,
}: {
    haptics: "Light" | "Medium" | "Heavy" | "Success" | "Warning" | "Error"
}) => {
    if (haptics === "Success" || haptics === "Warning" || haptics === "Error") {
        await triggerNotification({ level: haptics })
    } else if (
        haptics === "Light" ||
        haptics === "Medium" ||
        haptics === "Heavy"
    ) {
        await triggerImpact({ level: haptics })
    }
}

export default {
    triggerNotification,
    triggerImpact,
    triggerHaptics,
}
