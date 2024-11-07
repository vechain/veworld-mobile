import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect } from "react"
import { LogLevel, NotificationClickEvent, OneSignal, PushSubscriptionChangedState } from "react-native-onesignal"
import {
    selectNotificationOptedIn,
    selectNotificationPermissionEnabled,
    updateNotificationOptedIn,
    updateNotificationPermission,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type ContextType = {
    optIn: typeof OneSignal.User.pushSubscription.optIn
    optOut: typeof OneSignal.User.pushSubscription.optOut
    requestNotficationPermission: () => void
    isNotificationPermissionEnabled: boolean
    isUserOptedIn: boolean
}

const Context = createContext<ContextType | undefined>(undefined)
const logLevel = __DEV__ ? LogLevel.Debug : LogLevel.None
OneSignal.Debug.setLogLevel(logLevel)

const NotificationsProvider = React.memo(({ children }: PropsWithChildren) => {
    const dispatch = useAppDispatch()

    const permissionEnabled = useAppSelector(selectNotificationPermissionEnabled)
    const optedIn = useAppSelector(selectNotificationOptedIn)

    const initializeIneSignal = useCallback(() => {
        if (!process.env.ONE_SIGNAL_APP_ID) {
            throw new Error("One signal app id is not set")
        }

        OneSignal.initialize(process.env.ONE_SIGNAL_APP_ID as string)
    }, [])

    const getOptInStatus = useCallback(async () => {
        let _optInStatus = false

        try {
            _optInStatus = await OneSignal.User.pushSubscription.getOptedInAsync()
        } catch (error) {
            _optInStatus = false
        }

        dispatch(updateNotificationOptedIn(_optInStatus))
    }, [dispatch])

    const getPermission = useCallback(async () => {
        let _permissionEnabled = false

        try {
            _permissionEnabled = await OneSignal.Notifications.getPermissionAsync()
        } catch (error) {
            _permissionEnabled = false
        }

        dispatch(updateNotificationPermission(_permissionEnabled))
    }, [dispatch])

    const init = useCallback(async () => {
        initializeIneSignal()
        getOptInStatus()
        getPermission()
    }, [getOptInStatus, getPermission, initializeIneSignal])

    const requestPermission = useCallback(() => {
        dispatch(updateNotificationPermission(!permissionEnabled))

        OneSignal.Notifications.requestPermission(true)
            .then(result => {
                dispatch(updateNotificationPermission(result))
            })
            .catch(() => {
                dispatch(updateNotificationPermission(false))
            })
    }, [dispatch, permissionEnabled])

    const optInUser = useCallback(() => {
        OneSignal.User.pushSubscription.optIn()
        dispatch(updateNotificationOptedIn(true))
    }, [dispatch])

    const optOutUser = useCallback(() => {
        OneSignal.User.pushSubscription.optOut()
        dispatch(updateNotificationOptedIn(false))
    }, [dispatch])

    const onNotificationClicked = useCallback((_event: NotificationClickEvent) => {}, [])

    const onPermissionChanged = useCallback(
        (_permissionEnabled: boolean) => {
            dispatch(updateNotificationPermission(_permissionEnabled))
        },
        [dispatch],
    )

    const onOptInStatusChanged = useCallback(
        (event: PushSubscriptionChangedState) => {
            const { optedIn: previousOptedInStatuse } = event.previous
            const { optedIn: currentOptedInStatuse } = event.current

            if (previousOptedInStatuse !== currentOptedInStatuse) {
                dispatch(updateNotificationOptedIn(currentOptedInStatuse))
            }
        },
        [dispatch],
    )

    useEffect(() => {
        init()
    }, [init])

    useEffect(() => {
        OneSignal.Notifications.addEventListener("click", onNotificationClicked)
        OneSignal.Notifications.addEventListener("permissionChange", onPermissionChanged)
        OneSignal.User.pushSubscription.addEventListener("change", onOptInStatusChanged)

        return () => {
            OneSignal.Notifications.removeEventListener("click", onNotificationClicked)
            OneSignal.Notifications.removeEventListener("permissionChange", onPermissionChanged)
        }
    }, [onNotificationClicked, onOptInStatusChanged, onPermissionChanged])

    return (
        <Context.Provider
            value={{
                optIn: optInUser,
                optOut: optOutUser,
                requestNotficationPermission: requestPermission,
                isNotificationPermissionEnabled: permissionEnabled,
                isUserOptedIn: optedIn,
            }}>
            {children}
        </Context.Provider>
    )
})

const useNotifications = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useNotifications must be used within a NotificationsProvider")
    }

    return context
}

export { NotificationsProvider, useNotifications }
