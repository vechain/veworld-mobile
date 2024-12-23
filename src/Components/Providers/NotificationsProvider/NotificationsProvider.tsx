import { useNavigation } from "@react-navigation/native"
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { LogLevel, NotificationClickEvent, OneSignal, PushSubscriptionChangedState } from "react-native-onesignal"
import { ecosystemDappIdToVeBetterDappId, veBetterDaoTagKey } from "~Constants"
import { useAppState } from "~Hooks"
import { AppStateType, NETWORK_TYPE } from "~Model"
import {
    increaseDappVisitCounter,
    removeDappVisitCounter,
    selectDappVisitCounter,
    selectNotificationFeautureEnabled,
    selectNotificationOptedIn,
    selectNotificationPermissionEnabled,
    selectSelectedNetwork,
    setDappVisitCounter,
    updateNotificationOptedIn,
    updateNotificationPermission,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type ContextType = {
    featureEnabled: boolean
    optIn: typeof OneSignal.User.pushSubscription.optIn
    optOut: typeof OneSignal.User.pushSubscription.optOut
    requestNotficationPermission: () => void
    isNotificationPermissionEnabled: boolean
    isUserOptedIn: boolean
    increaseDappCounter: (dappId: string) => void
    getTags: () => Promise<{
        [key: string]: string
    }>
    addTag: (key: string, value: string) => void
    removeTag: (key: string) => void
    removeAllTags: () => void
}

const Context = createContext<ContextType | undefined>(undefined)
const logLevel = __DEV__ ? LogLevel.Debug : LogLevel.None
OneSignal.Debug.setLogLevel(logLevel)

const NotificationsProvider = ({ children }: PropsWithChildren) => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation()

    const permissionEnabled = useAppSelector(selectNotificationPermissionEnabled)
    const optedIn = useAppSelector(selectNotificationOptedIn)
    const dappVisitCounter = useAppSelector(selectDappVisitCounter)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const featureEnabled = useAppSelector(selectNotificationFeautureEnabled)
    const isFetcingTags = useRef(false)

    const { currentState, previousState } = useAppState()

    const isMainnet = selectedNetwork.type === NETWORK_TYPE.MAIN

    const initializeIneSignal = useCallback(() => {
        if (!process.env.ONE_SIGNAL_APP_ID) {
            throw new Error("One signal app id is not set")
        }

        OneSignal.initialize(process.env.ONE_SIGNAL_APP_ID)
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

    const onNotificationClicked = useCallback(
        (event: NotificationClickEvent) => {
            if (event.notification.additionalData) {
                const { route, navParams } = event.notification.additionalData as {
                    route?: string
                    navParams?: string
                }

                if (route) {
                    navigation.navigate(route as any, navParams ? JSON.parse(navParams) : undefined)
                }
            }
        },
        [navigation],
    )

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

    const init = useCallback(async () => {
        initializeIneSignal()
        OneSignal.User.pushSubscription.optIn()
        await getOptInStatus()
        await getPermission()
        OneSignal.User.addTag(veBetterDaoTagKey, "true")
    }, [getOptInStatus, getPermission, initializeIneSignal])

    const getTags = useCallback(() => {
        return OneSignal.User.getTags()
    }, [])

    const addTag = useCallback(
        (key: string, value: string) => {
            OneSignal.User.addTag(key, value)
            dispatch(setDappVisitCounter({ dappId: key, counter: 2 }))
        },
        [dispatch],
    )

    const removeTag = useCallback(
        (key: string) => {
            OneSignal.User.removeTag(key)
            dispatch(removeDappVisitCounter({ dappId: key }))
        },
        [dispatch],
    )

    const removeAllTags = useCallback(() => {
        getTags()?.then(tags => {
            const tagKeys = Object.keys(tags)
            const tagsToRemove = tagKeys.filter(tag => tag !== veBetterDaoTagKey)
            OneSignal.User.removeTags(tagsToRemove)
        })
    }, [getTags])

    useEffect(() => {
        featureEnabled && init()
    }, [featureEnabled, init])

    useEffect(() => {
        if (!featureEnabled) {
            return
        }

        OneSignal.Notifications.addEventListener("click", onNotificationClicked)
        OneSignal.Notifications.addEventListener("permissionChange", onPermissionChanged)
        OneSignal.User.pushSubscription.addEventListener("change", onOptInStatusChanged)

        return () => {
            if (!featureEnabled) {
                return
            }

            OneSignal.Notifications.removeEventListener("click", onNotificationClicked)
            OneSignal.Notifications.removeEventListener("permissionChange", onPermissionChanged)
            OneSignal.User.pushSubscription.removeEventListener("change", onOptInStatusChanged)
        }
    }, [featureEnabled, onNotificationClicked, onOptInStatusChanged, onPermissionChanged])

    useEffect(() => {
        if (
            currentState === AppStateType.ACTIVE &&
            currentState !== previousState &&
            !isFetcingTags.current &&
            isMainnet &&
            featureEnabled
        ) {
            isFetcingTags.current = true
            getTags()
                .then(tags => {
                    Object.entries(dappVisitCounter).forEach(([dappId, counter]) => {
                        if (tags[dappId] && tags[dappId] === "true" && dappVisitCounter[dappId] !== 2) {
                            dispatch(setDappVisitCounter({ dappId: dappId, counter: 2 }))
                        } else if (counter >= 2) {
                            addTag(dappId, "true")
                        }
                    })
                })
                .finally(() => {
                    isFetcingTags.current = false
                })
        }
    }, [dappVisitCounter, dispatch, currentState, previousState, isMainnet, addTag, getTags, featureEnabled])

    const increaseDappCounter = useCallback(
        (dappId: string) => {
            if (isMainnet) {
                const id = ecosystemDappIdToVeBetterDappId[dappId]
                dispatch(increaseDappVisitCounter({ dappId: id ?? dappId }))
            }
        },
        [dispatch, isMainnet],
    )

    const contextValue = useMemo(() => {
        return {
            featureEnabled: featureEnabled,
            optIn: optInUser,
            optOut: optOutUser,
            requestNotficationPermission: requestPermission,
            isNotificationPermissionEnabled: permissionEnabled,
            isUserOptedIn: optedIn,
            increaseDappCounter: increaseDappCounter,
            addTag: addTag,
            removeTag: removeTag,
            getTags: getTags,
            removeAllTags: removeAllTags,
        }
    }, [
        addTag,
        featureEnabled,
        getTags,
        increaseDappCounter,
        optInUser,
        optOutUser,
        optedIn,
        permissionEnabled,
        removeAllTags,
        removeTag,
        requestPermission,
    ])

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

const useNotifications = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useNotifications must be used within a NotificationsProvider")
    }

    return context
}

export { NotificationsProvider, useNotifications }
