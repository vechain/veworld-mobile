import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect } from "react"
import { LogLevel, OneSignal } from "react-native-onesignal"
import {
    selectNotificationPermissionEnabled,
    updateNotificationPermission,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type ContextType = {
    requestPermission: () => void
    permissionEnabled: boolean
}

const Context = createContext<ContextType | undefined>(undefined)
const logLevel = __DEV__ ? LogLevel.Debug : LogLevel.None
OneSignal.Debug.setLogLevel(logLevel)

const NotificationsProvider = React.memo(({ children }: PropsWithChildren) => {
    const dispatch = useAppDispatch()

    const permissionEnabled = useAppSelector(selectNotificationPermissionEnabled)

    const initializeIneSignal = useCallback(() => {
        if (!process.env.ONE_SIGNAL_APP_ID) {
            throw new Error("One signal app id is not set")
        }

        OneSignal.initialize(process.env.ONE_SIGNAL_APP_ID as string)
    }, [])

    const getPermission = useCallback(async () => {
        let _permissionEnabled = false

        try {
            _permissionEnabled = await OneSignal.Notifications.getPermissionAsync()
        } catch (error) {
            _permissionEnabled = false
        }

        dispatch(updateNotificationPermission(_permissionEnabled))
    }, [dispatch])

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

    const onNotificationClicked = useCallback(() => {}, [])

    const onPermissionChanged = useCallback(
        (_permissionEnabled: boolean) => {
            dispatch(updateNotificationPermission(_permissionEnabled))
        },
        [dispatch],
    )

    useEffect(() => {
        initializeIneSignal()
        getPermission()
    }, [dispatch, getPermission, initializeIneSignal])

    useEffect(() => {
        OneSignal.Notifications.addEventListener("click", onNotificationClicked)
        OneSignal.Notifications.addEventListener("permissionChange", onPermissionChanged)

        return () => {
            OneSignal.Notifications.removeEventListener("click", onNotificationClicked)
            OneSignal.Notifications.removeEventListener("permissionChange", onPermissionChanged)
        }
    }, [onNotificationClicked, onPermissionChanged])

    return (
        <Context.Provider
            value={{
                requestPermission: requestPermission,
                permissionEnabled: permissionEnabled,
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
