import { requestFromEndpoint } from "~Networking/API/Helpers"

interface NotificationAPIResponse {
    failed: string[] // Array of addresses that failed
}

type ProviderDetails = {
    appId: string
    subscriptionId: string | null
}

type PushNotificationRequest = {
    walletAddresses: string[]
    subscriptionId: string | null
}

type NotificationPayload = {
    walletAddresses: string[]
    provider: string
    providerDetails: ProviderDetails
}

const sendRequest = (
    method: "POST" | "DELETE",
    walletAddresses: string[],
    subscriptionId: string | null,
): Promise<NotificationAPIResponse> => {
    const baseUrl = __DEV__ ? "http://192.168.86.21:8085" : process.env.NOTIFICATION_CENTER_REGISTER_PROD

    if (!baseUrl) {
        throw new Error("[NOTIFICATION CENTER]: Base URL not configured")
    }

    const appId = __DEV__ ? process.env.ONE_SIGNAL_APP_ID : process.env.ONE_SIGNAL_APP_ID_PROD

    if (!appId) {
        throw new Error("[NOTIFICATION CENTER]: OneSignal App ID not configured")
    }

    const payload: NotificationPayload = {
        walletAddresses,
        provider: "onesignal",
        providerDetails: {
            appId,
            subscriptionId,
        },
    }

    return requestFromEndpoint<NotificationAPIResponse>({
        url: `${baseUrl}/api/v1/push-registrations`,
        data: payload,
        method,
    })
}

export const registerPushNotification = ({
    walletAddresses,
    subscriptionId,
}: PushNotificationRequest): Promise<NotificationAPIResponse> => sendRequest("POST", walletAddresses, subscriptionId)

export const unregisterPushNotification = ({
    walletAddresses,
    subscriptionId,
}: PushNotificationRequest): Promise<NotificationAPIResponse> => sendRequest("DELETE", walletAddresses, subscriptionId)
