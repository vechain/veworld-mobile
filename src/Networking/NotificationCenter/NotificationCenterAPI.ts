import { NETWORK_TYPE } from "~Model"
import { requestFromEndpoint } from "~Networking/API/Helpers"

interface NotificationAPIResponse {
    failed: string[] // Array of addresses that failed
}

export const NOTIFICATION_CENTER_BASE_URL = {
    [NETWORK_TYPE.MAIN]: process.env.NOTIFICATION_CENTER_REGISTER_PROD,
    [NETWORK_TYPE.TEST]: process.env.NOTIFICATION_CENTER_REGISTER_DEV,
}

export const ONESIGNAL_APP_ID = {
    [NETWORK_TYPE.MAIN]: process.env.ONE_SIGNAL_APP_ID_PROD,
    [NETWORK_TYPE.TEST]: process.env.ONE_SIGNAL_APP_ID,
}

export const isValidNotificationCenterNetwork = (
    value: NETWORK_TYPE,
): value is Extract<NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST> => [NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST].includes(value)

const executeIfValidNetwork = <TReturnType>(
    networkType: NETWORK_TYPE,
    path: string,
    cb: (url: string, appId: string) => TReturnType,
): TReturnType => {
    if (isValidNotificationCenterNetwork(networkType)) {
        const baseUrl = NOTIFICATION_CENTER_BASE_URL[networkType]
        const appId = ONESIGNAL_APP_ID[networkType]

        if (!baseUrl) {
            throw new Error("[NOTIFICATION CENTER]: Base URL not configured")
        }
        if (!appId) {
            throw new Error("[NOTIFICATION CENTER]: OneSignal App ID not configured")
        }

        return cb(`${baseUrl}${path}`, appId)
    }
    throw new Error("[NOTIFICATION CENTER]: Invalid Network")
}

type ProviderDetails = {
    appId: string
    subscriptionId: string | null
}

type RegisterPushNotificationRequest = {
    networkType: NETWORK_TYPE
    walletAddresses: string[]
    subscriptionId: string | null
}

type RegisterPushNotificationPayload = {
    walletAddresses: string[]
    provider: string
    providerDetails: ProviderDetails
}

type UnregisterPushNotificationRequest = {
    networkType: NETWORK_TYPE
    walletAddresses: string[]
    subscriptionId: string | null
}

type UnregisterPushNotificationPayload = {
    walletAddresses: string[]
    provider: string
    providerDetails: ProviderDetails
}

export const registerPushNotification = ({
    networkType,
    walletAddresses,
    subscriptionId,
}: RegisterPushNotificationRequest): Promise<NotificationAPIResponse> =>
    executeIfValidNetwork(networkType, "/api/v1/push-registrations", (url, appId) => {
        const payload: RegisterPushNotificationPayload = {
            walletAddresses,
            provider: "onesignal",
            providerDetails: {
                appId,
                subscriptionId,
            },
        }

        return requestFromEndpoint<NotificationAPIResponse>({
            url,
            data: payload,
            method: "POST",
        })
    })

export const unregisterPushNotification = ({
    networkType,
    walletAddresses,
    subscriptionId,
}: UnregisterPushNotificationRequest): Promise<NotificationAPIResponse> =>
    executeIfValidNetwork(networkType, "/api/v1/push-registrations", (url, appId) => {
        const payload: UnregisterPushNotificationPayload = {
            walletAddresses,
            provider: "onesignal",
            providerDetails: {
                appId,
                subscriptionId,
            },
        }

        return requestFromEndpoint<NotificationAPIResponse>({
            url,
            data: payload,
            method: "DELETE",
        })
    })
