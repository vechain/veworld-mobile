import { useNavigation } from "@react-navigation/native"
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { LogLevel, NotificationClickEvent, OneSignal, PushSubscriptionChangedState } from "react-native-onesignal"
import { ERROR_EVENTS, vechainNewsAndUpdates } from "~Constants"
import { useAppState } from "~Hooks"
import { AppStateType, NETWORK_TYPE } from "~Model"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { useNotificationSync } from "~Hooks/useNotificationSync"
import {
    addRemovedNotificationTag,
    increaseDappVisitCounter,
    removeDappVisitCounter,
    removeRemovedNotificationTag,
    selectDappNotifications,
    selectDappVisitCounter,
    selectNotificationFeautureEnabled,
    selectNotificationOptedIn,
    selectNotificationPermissionEnabled,
    selectRemovedNotificationTags,
    selectSelectedNetwork,
    setDappVisitCounter,
    updateNotificationFeatureFlag,
    updateNotificationOptedIn,
    updateNotificationPermission,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useFeatureFlags } from "../FeatureFlagsProvider"
import { error } from "~Utils"
import { Routes } from "../../../Navigation"

type ContextType = {
    featureEnabled: boolean
    optIn: typeof OneSignal.User.pushSubscription.optIn
    optOut: typeof OneSignal.User.pushSubscription.optOut
    requestNotficationPermission: () => void
    isNotificationPermissionEnabled: boolean | null
    isUserOptedIn: boolean | null
    increaseDappCounter: (dappId: string) => void
    getTags: () => Promise<{
        [key: string]: string
    }>
    addTag: (key: string, value: string) => void
    addDAppTag: (key: string) => void
    removeTag: (key: string) => void
    removeDAppTag: (key: string) => void
    removeAllTags: () => void
}

const Context = createContext<ContextType | undefined>(undefined)
const logLevel = __DEV__ ? LogLevel.Debug : LogLevel.None
OneSignal.Debug.setLogLevel(logLevel)

const NotificationsProvider = ({ children }: PropsWithChildren) => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation()
    const { notificationCenter, pushNotificationFeature } = useFeatureFlags()
    const { data: dapps = [] } = useVeBetterDaoDapps()

    const permissionEnabled = useAppSelector(selectNotificationPermissionEnabled)
    const optedIn = useAppSelector(selectNotificationOptedIn)
    const dappVisitCounter = useAppSelector(selectDappVisitCounter)
    const removedNotificationTags = useAppSelector(selectRemovedNotificationTags)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const featureEnabled = useAppSelector(selectNotificationFeautureEnabled)
    const dappsNotifications = useAppSelector(selectDappNotifications)
    const isFetcingTags = useRef(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const { currentState, previousState } = useAppState()

    const isMainnet = selectedNetwork.type === NETWORK_TYPE.MAIN

    useNotificationSync({ enabled: isInitialized && notificationCenter?.registration?.enabled === true })

    const initializeOneSignal = useCallback(async () => {
        const appId = __DEV__ ? process.env.ONE_SIGNAL_APP_ID : process.env.ONE_SIGNAL_APP_ID_PROD

        try {
            OneSignal.initialize(appId as string)
            setIsInitialized(true)
        } catch (err) {
            error(ERROR_EVENTS.ONE_SIGNAL, err)
            throw err
        }
    }, [])

    const getOptInStatus = useCallback(async () => {
        let _optInStatus = false

        try {
            _optInStatus = await OneSignal.User.pushSubscription.getOptedInAsync()
        } catch {
            _optInStatus = false
        }

        dispatch(updateNotificationOptedIn(_optInStatus))
    }, [dispatch])

    const getPermission = useCallback(async () => {
        let _permissionEnabled = false

        try {
            _permissionEnabled = await OneSignal.Notifications.getPermissionAsync()
        } catch {
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
            const launchURL = event.notification.launchURL

            if (launchURL) {
                return
            }

            try {
                if (event.notification.additionalData) {
                    const { route, navParams } = event.notification.additionalData as {
                        route?: string
                        navParams?: string
                    }

                    if (route) {
                        const parsedParams = navParams ? JSON.parse(navParams) : undefined

                        // If navigating to browser and no returnScreen is specified, provide a safe default
                        if (route === "Browser" && parsedParams && !parsedParams.returnScreen) {
                            parsedParams.returnScreen = Routes.HOME
                        }

                        navigation.navigate(route as any, parsedParams)
                    }
                }
            } catch {}
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

    const getTags = useCallback(() => {
        return OneSignal.User.getTags()
    }, [])

    const addTag = useCallback(
        (key: string, value: string) => {
            OneSignal.User.addTag(key, value)
            dispatch(removeRemovedNotificationTag(key))
        },
        [dispatch],
    )

    const addDAppTag = useCallback(
        (key: string) => {
            addTag(key, "true")
            dispatch(setDappVisitCounter({ dappId: key, counter: 2 }))
        },
        [addTag, dispatch],
    )

    const removeTag = useCallback(
        (key: string) => {
            OneSignal.User.removeTag(key)

            if (!removedNotificationTags?.includes(key)) {
                dispatch(addRemovedNotificationTag(key))
            }
        },
        [dispatch, removedNotificationTags],
    )

    const removeDAppTag = useCallback(
        (key: string) => {
            removeTag(key)
            dispatch(removeDappVisitCounter({ dappId: key }))
        },
        [dispatch, removeTag],
    )

    const removeAllTags = useCallback(() => {
        getTags()?.then(tags => {
            const tagKeys = Object.keys(tags)
            OneSignal.User.removeTags(tagKeys)
        })
    }, [getTags])

    const updateDappNotifications = useCallback(async () => {
        if (dapps.length > 0) {
            const tags = await getTags()
            const allEnabled = dapps.every(dapp => !!tags[dapp.id])
            if (!allEnabled) {
                dapps.forEach(dapp => {
                    if (!tags[dapp.id]) {
                        addDAppTag(dapp.id)
                    }
                })
            }
        }
    }, [dapps, getTags, addDAppTag])

    const init = useCallback(async () => {
        initializeOneSignal()
        await getOptInStatus()
        await getPermission()

        if (!removedNotificationTags?.includes(vechainNewsAndUpdates)) {
            addTag(vechainNewsAndUpdates, "true")
        }

        // Keep the dapp notifications in sync with the dapps list
        if (dappsNotifications) {
            updateDappNotifications()
        }
    }, [
        addTag,
        dappsNotifications,
        getOptInStatus,
        getPermission,
        initializeOneSignal,
        removedNotificationTags,
        updateDappNotifications,
    ])

    useEffect(() => {
        dispatch(updateNotificationFeatureFlag(pushNotificationFeature?.enabled))
    }, [dispatch, pushNotificationFeature?.enabled])

    useEffect(() => {
        featureEnabled && init()
    }, [init, featureEnabled])

    useEffect(() => {
        if (!featureEnabled) {
            return
        }

        OneSignal.Notifications.addEventListener("click", onNotificationClicked)
        OneSignal.Notifications.addEventListener("permissionChange", onPermissionChanged)

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
                ?.then(tags => {
                    Object.entries(dappVisitCounter).forEach(([dappId, counter]) => {
                        if (tags[dappId] && tags[dappId] === "true" && dappVisitCounter[dappId] !== 2) {
                            dispatch(setDappVisitCounter({ dappId: dappId, counter: 2 }))
                        } else if (!removedNotificationTags?.includes(dappId) && counter >= 2) {
                            addTag(dappId, "true")
                        }
                    })
                })
                .finally(() => {
                    isFetcingTags.current = false
                })
        }
    }, [
        dappVisitCounter,
        dispatch,
        currentState,
        previousState,
        isMainnet,
        addTag,
        getTags,
        featureEnabled,
        removedNotificationTags,
    ])

    const increaseDappCounter = useCallback(
        (dappId: string) => {
            if (dappId && isMainnet && featureEnabled) {
                dispatch(increaseDappVisitCounter({ dappId: dappId }))
            }
        },
        [dispatch, featureEnabled, isMainnet],
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
            addDAppTag: addDAppTag,
            removeDAppTag: removeDAppTag,
        }
    }, [
        addDAppTag,
        addTag,
        featureEnabled,
        getTags,
        increaseDappCounter,
        optInUser,
        optOutUser,
        optedIn,
        permissionEnabled,
        removeAllTags,
        removeDAppTag,
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
