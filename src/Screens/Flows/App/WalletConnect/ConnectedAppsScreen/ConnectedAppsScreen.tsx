import React, { Fragment, useCallback, useMemo, useRef, useState } from "react"
import { BaseSpacer, BaseText, BaseView, Layout, SwipeableRow, useWalletConnect } from "~Components"
import {
    ConnectedDiscoveryApp,
    removeConnectedDiscoveryApp,
    selectConnectedDiscoverDApps,
    selectFeaturedImages,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { SessionTypes } from "@walletconnect/types"
import {
    AppDetailsBottomSheet,
    ConfirmDisconnectBottomSheet,
    ConnectedAppBox,
    ConnectedAppsHeader,
    EmptyListView,
} from "./Components"
import { useI18nContext } from "~i18n"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { useBottomSheetModal } from "~Hooks"

type DiscoveryConnectedApp = {
    app: ConnectedDiscoveryApp
    type: "in-app"
    image?: object
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
    const dappImages = useAppSelector(selectFeaturedImages)
    const [selectedApp, setSelectedApp] = useState<ConnectedApp>()
    const dispatch = useAppDispatch()

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const connectedApps: ConnectedApp[] = useMemo(() => {
        const sessions = Object.values(activeSessions)

        const discoveryDApps = connectedDiscoveryApps.map(app => {
            let imageId: string

            try {
                imageId = new URL(app.href).hostname
            } catch {
                imageId = app.href
            }

            return {
                type: "in-app" as const,
                app,
                image: dappImages[imageId],
            }
        })

        const wcApps: ConnectedApp[] = sessions.map(session => {
            return {
                type: "wallet-connect" as const,
                session,
            }
        })

        return [...discoveryDApps, ...wcApps]
    }, [dappImages, activeSessions, connectedDiscoveryApps])

    const totalSessions = useMemo(() => {
        return Object.keys(activeSessions).length
    }, [activeSessions])

    const {
        ref: confirmDisconnectBottomSheetRef,
        onOpen: openConfirmDisconnectDetailsSheet,
        onClose: closeConfirmDisconnectDetailsSheet,
    } = useBottomSheetModal()

    const {
        ref: connectedAppDetailsBottomSheetRef,
        onOpen: openConnectedAppDetailsSheet,
        onClose: closeConnectedAppDetailsSheet,
    } = useBottomSheetModal()

    const disconnect = useCallback(
        async (connectedApp: ConnectedApp) => {
            if (connectedApp.type === "in-app") {
                await dispatch(removeConnectedDiscoveryApp(connectedApp.app))
            } else {
                await disconnectSession(connectedApp.session.topic)
            }

            closeConfirmDisconnectDetailsSheet()
        },
        [dispatch, closeConfirmDisconnectDetailsSheet, disconnectSession],
    )

    const onClick = useCallback(
        (connectedApp: ConnectedApp) => {
            setSelectedApp(connectedApp)
            //TODO: Why does the bottom sheet not open if called immediately?
            setTimeout(() => {
                openConnectedAppDetailsSheet()
            }, 20)
        },
        [openConnectedAppDetailsSheet],
    )

    return (
        <Layout
            safeAreaTestID="ConnectedAppsScreen"
            noMargin
            body={
                <BaseView pt={16}>
                    <BaseView mx={20}>
                        <ConnectedAppsHeader showAddButton={totalSessions > 0} />

                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subTitle">{LL.CONNECTED_APPS_SCREEN_SUBTITLE()}</BaseText>
                        <BaseSpacer height={12} />
                        <BaseText typographyFont="buttonSecondary">{LL.CONNECTED_APPS_SCREEN_DESCRIPTION()}</BaseText>

                        <BaseSpacer height={22} />

                        {connectedApps.length === 0 && (
                            <>
                                <BaseSpacer height={60} />
                                <EmptyListView />
                            </>
                        )}
                    </BaseView>
                    {connectedApps.map((connectedApp, index) => {
                        const key = generateAppKey(connectedApp)

                        return (
                            <BaseView key={`base-view-${key}-${index}`}>
                                <Fragment key={key}>
                                    <SwipeableRow
                                        item={connectedApp}
                                        itemKey={`swipeable-row-${key}`}
                                        swipeableItemRefs={swipeableItemRefs}
                                        handleTrashIconPress={openConfirmDisconnectDetailsSheet}
                                        setSelectedItem={setSelectedApp}
                                        onPress={onClick}
                                        isOpen={selectedApp && key === generateAppKey(selectedApp)}>
                                        <ConnectedAppBox key={key} connectedApp={connectedApp} />
                                    </SwipeableRow>
                                </Fragment>
                            </BaseView>
                        )
                    })}

                    {selectedApp && (
                        <>
                            <ConfirmDisconnectBottomSheet
                                ref={confirmDisconnectBottomSheetRef}
                                connectedApp={selectedApp}
                                onConfirm={disconnect}
                                onCancel={closeConfirmDisconnectDetailsSheet}
                            />
                            <AppDetailsBottomSheet
                                ref={connectedAppDetailsBottomSheetRef}
                                onClose={closeConnectedAppDetailsSheet}
                                connectedApp={selectedApp}
                                onDisconnect={openConfirmDisconnectDetailsSheet}
                            />
                        </>
                    )}
                </BaseView>
            }
        />
    )
}
