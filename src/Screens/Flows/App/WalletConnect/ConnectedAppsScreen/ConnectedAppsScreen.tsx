import { SessionTypes } from "@walletconnect/types"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BaseSpacer, BaseView, Layout, SwipeableRow } from "~Components"
import { useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { DiscoveryDApp } from "~Constants"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    removeConnectedDiscoveryApp,
    selectConnectedDiscoverDApps,
    selectFeaturedDapps,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { ConfirmDisconnectBottomSheet, ConnectedAppBox, EmptyListView } from "./Components"
import { mapConnectedApps } from "./ConnectedAppUtils"

type DiscoveryConnectedApp = {
    app: DiscoveryDApp
    type: "in-app"
}
type WCConnectedApp = {
    type: "wallet-connect"
    session: SessionTypes.Struct
}

export type ConnectedApp = DiscoveryConnectedApp | WCConnectedApp

const generateAppKey = (app: ConnectedApp) => {
    if (app.type === "in-app") {
        return app.app.href
    }

    return app.session.topic
}

export const ConnectedAppsScreen = () => {
    const { LL } = useI18nContext()
    const { disconnectSession, activeSessions } = useWalletConnect()
    const connectedDiscoveryApps = useAppSelector(selectConnectedDiscoverDApps)
    const allApps = useAppSelector(selectFeaturedDapps)
    const [selectedApp, setSelectedApp] = useState<ConnectedApp>()

    const dispatch = useAppDispatch()

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const connectedApps: ConnectedApp[] = useMemo(() => {
        const sessions = Object.values(activeSessions)

        const discoveryDApps = mapConnectedApps(connectedDiscoveryApps, allApps)

        const wcApps: ConnectedApp[] = sessions.map(session => {
            return {
                type: "wallet-connect" as const,
                session,
            }
        })

        return [...discoveryDApps, ...wcApps]
    }, [activeSessions, connectedDiscoveryApps, allApps])

    const {
        ref: confirmDisconnectBottomSheetRef,
        onOpen: openConfirmDisconnectDetailsSheet,
        onClose: closeConfirmDisconnectDetailsSheet,
    } = useBottomSheetModal()

    const disconnect = useCallback(async () => {
        if (!selectedApp) return
        if (selectedApp.type === "in-app") {
            dispatch(
                removeConnectedDiscoveryApp({
                    href: new URL(selectedApp.app.href).hostname,
                    name: selectedApp.app.name,
                    connectedTime: Date.now(),
                }),
            )
        } else {
            await disconnectSession(selectedApp.session.topic)
        }

        closeConfirmDisconnectDetailsSheet()
    }, [selectedApp, closeConfirmDisconnectDetailsSheet, dispatch, disconnectSession])

    const onClick = useCallback(
        (connectedApp: ConnectedApp) => {
            setSelectedApp(connectedApp)
            openConfirmDisconnectDetailsSheet(connectedApp)
        },
        [openConfirmDisconnectDetailsSheet],
    )

    const handleTrashIconPress = useCallback(
        (item: ConnectedApp) => {
            setSelectedApp(item)
            openConfirmDisconnectDetailsSheet(item)
        },
        [openConfirmDisconnectDetailsSheet],
    )

    return (
        <Layout
            safeAreaTestID="ConnectedAppsScreen"
            title={LL.CONNECTED_APPS_SCREEN_TITLE()}
            body={
                <BaseView>
                    {connectedApps.length === 0 && (
                        <>
                            <BaseSpacer height={60} />
                            <EmptyListView />
                        </>
                    )}
                    {connectedApps.map((connectedApp, index) => {
                        const key = generateAppKey(connectedApp)

                        return (
                            <BaseView key={`base-view-${key}-${index}`}>
                                <SwipeableRow
                                    item={connectedApp}
                                    itemKey={`swipeable-row-${key}`}
                                    swipeableItemRefs={swipeableItemRefs}
                                    handleTrashIconPress={handleTrashIconPress}
                                    onPress={onClick}
                                    isOpen={selectedApp && key === generateAppKey(selectedApp)}
                                    testID={`CONNECTED_APP_${key}`}
                                    xMargins={0}>
                                    <ConnectedAppBox key={key} connectedApp={connectedApp} />
                                </SwipeableRow>
                            </BaseView>
                        )
                    })}

                    <ConfirmDisconnectBottomSheet
                        ref={confirmDisconnectBottomSheetRef}
                        onConfirm={disconnect}
                        onCancel={closeConfirmDisconnectDetailsSheet}
                    />
                </BaseView>
            }
        />
    )
}
