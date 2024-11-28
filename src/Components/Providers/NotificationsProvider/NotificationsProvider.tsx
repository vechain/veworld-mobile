import { useNavigation } from "@react-navigation/native"
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef } from "react"
import { LogLevel, NotificationClickEvent, OneSignal, PushSubscriptionChangedState } from "react-native-onesignal"
import { useAppState } from "~Hooks"
import { AppStateType } from "~Model"
import {
    selectDappVisitCounter,
    selectNotificationOptedIn,
    selectNotificationPermissionEnabled,
    setDappVisitCounter,
    updateNotificationOptedIn,
    updateNotificationPermission,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

/* DAO DAPPS ADDRESSES (updated 2024-11-14) */
// export const dappAddress = {
//     mugshot: "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
//     cleanify: "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3",
//     greencart: "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
//     greenambassador: "0x821a9ae30590c7c11e0ebc03b27902e8cae0f320ad27b0f5bde9f100eebcb5a7",
//     oily: "0xcd9f16381818b575a55661602638102b2b8497a202bb2497bb2a3a2cd438e85d",
//     evearn: "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9",
//     vyvo: "0xa30ddd53895674f3517ed4eb8f7261a4287ec1285fdd13b1c19a1d7009e5b7e3",
//     nfbc: "0x74133534672eca50a67f8b20bf17dd731b70d83f0a12e3500fca0793fca51c7d",
//     pauseyourcarbon: "0xe19c5e83670576cac1cee923e1f92990387bf701af06ff3e0c5f1be8d265c478",
//     greencommuter: "0x6a825c7d259075d70a88cbd1932604ee3009777e14645ced6881a32b9c165ca4",
//     solarwise: "0x1cdf0d2cc9bb81296647c3b6baae1006471a719e67c6431155db920d71242afb",
//     carbonlarity: "0xca0b325c7d08aa29642c6a82e490c99bac53e5e53dce402faa1ec12b7e382409",
//     st3pr: "0x698555a1fc7b34a52900e3df2d68dd380fa3dfae3b3ed65dba0d230cdab17689",
// }

export const ecosystemDappIdToVeBetterDappId = {
    "vet.mugshot": "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
    "vet.cleanify": "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3",
    "vet.greencart": "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
    "com.greenambassadorchallenge": "0x821a9ae30590c7c11e0ebc03b27902e8cae0f320ad27b0f5bde9f100eebcb5a7",
    "network.uco.oily": "0xcd9f16381818b575a55661602638102b2b8497a202bb2497bb2a3a2cd438e85d",
    "io.evearn": "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9",
    vyvo: "0xa30ddd53895674f3517ed4eb8f7261a4287ec1285fdd13b1c19a1d7009e5b7e3",
    "com.nfbc": "0x74133534672eca50a67f8b20bf17dd731b70d83f0a12e3500fca0793fca51c7d",
    "com.pauseyourcarbon": "0xe19c5e83670576cac1cee923e1f92990387bf701af06ff3e0c5f1be8d265c478",
    "vet.greencommuter": "0x6a825c7d259075d70a88cbd1932604ee3009777e14645ced6881a32b9c165ca4",
    "vet.solarwise.app": "0x1cdf0d2cc9bb81296647c3b6baae1006471a719e67c6431155db920d71242afb",
    carbonlarity: "0xca0b325c7d08aa29642c6a82e490c99bac53e5e53dce402faa1ec12b7e382409",
    "vet.st3pr": "0x698555a1fc7b34a52900e3df2d68dd380fa3dfae3b3ed65dba0d230cdab17689",
} as { [key: string]: string }

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
    const navigation = useNavigation()

    const permissionEnabled = useAppSelector(selectNotificationPermissionEnabled)
    const optedIn = useAppSelector(selectNotificationOptedIn)
    const dappVisitCounter = useAppSelector(selectDappVisitCounter)
    const isFetcingTags = useRef(false)

    const { currentState, previousState } = useAppState()

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
        getOptInStatus()
        getPermission()
        OneSignal.User.pushSubscription.optIn()
        OneSignal.User.addTag("VeBetterDao", "true")
    }, [getOptInStatus, getPermission, initializeIneSignal])

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
            OneSignal.User.pushSubscription.removeEventListener("change", onOptInStatusChanged)
        }
    }, [onNotificationClicked, onOptInStatusChanged, onPermissionChanged])

    useEffect(() => {
        if (currentState === AppStateType.ACTIVE && currentState !== previousState && !isFetcingTags.current) {
            isFetcingTags.current = true
            OneSignal.User.getTags()
                .then(tags => {
                    Object.entries(dappVisitCounter).forEach(([dappId, counter]) => {
                        if (tags[dappId] && !dappVisitCounter[dappId]) {
                            dispatch(setDappVisitCounter({ dappId: dappId, counter: 2 }))
                        } else if (counter >= 2) {
                            OneSignal.User.addTag(dappId, "true")
                        }
                    })
                })
                .finally(() => {
                    isFetcingTags.current = false
                })
        }
    }, [dappVisitCounter, dispatch, currentState, previousState])

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
