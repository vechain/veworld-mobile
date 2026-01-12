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
    baseUrl: string
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
    baseUrl: string,
): Promise<NotificationAPIResponse> => {
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
    baseUrl,
}: PushNotificationRequest): Promise<NotificationAPIResponse> =>
    sendRequest("POST", walletAddresses, subscriptionId, baseUrl)

export const unregisterPushNotification = ({
    walletAddresses,
    subscriptionId,
    baseUrl,
}: PushNotificationRequest): Promise<NotificationAPIResponse> =>
    sendRequest("DELETE", walletAddresses, subscriptionId, baseUrl)

// Notification Preferences API
export interface NotificationPreferencesResponse {
    subscriptionId: string
    disabledCategories: string[]
}

type UpdatePreferencesParams = {
    subscriptionId: string
    disabledCategories: string[]
    baseUrl: string
}

export const updateNotificationPreferences = ({
    subscriptionId,
    disabledCategories,
    baseUrl,
}: UpdatePreferencesParams): Promise<NotificationPreferencesResponse> => {
    return requestFromEndpoint<NotificationPreferencesResponse>({
        url: `${baseUrl}/api/v1/notification-preferences/${subscriptionId}`,
        data: { disabledCategories },
        method: "PUT",
        timeout: 5000,
    })
}
