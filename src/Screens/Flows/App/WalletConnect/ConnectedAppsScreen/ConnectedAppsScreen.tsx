import React, { Fragment, useCallback, useMemo, useRef, useState } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    SwipeableRow,
    useWalletConnect,
} from "~Components"
import { SessionTypes } from "@walletconnect/types"
import { isEmpty } from "lodash"
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
import { selectAccounts, useAppSelector } from "~Storage/Redux"

/**
 * A map of account addresses to an array of sessions
 */
type AccountApps = Record<string, SessionTypes.Struct[]>

export const ConnectedAppsScreen = () => {
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const { disconnectSession, activeSessions } = useWalletConnect()
    const [sessionToDelete, setSessionToDelete] =
        useState<SessionTypes.Struct>()

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
    )

    const connectedApps = useMemo(() => {
        const sessions = Object.values(activeSessions)

        const apps: AccountApps = {}

        sessions.forEach(session => {
            const account = session.namespaces.vechain.accounts[0].split(":")[2]

            if (!apps[account]) {
                apps[account] = []
            }

            apps[account].push(session)
        })

        return apps
    }, [activeSessions])

    const totalSessions = useMemo(() => {
        return Object.values(connectedApps).reduce(
            (acc, curr) => acc + curr.length,
            0,
        )
    }, [connectedApps])

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

    const removeApp = useCallback(
        async (topic: string) => {
            await disconnectSession(topic)
            closeConfirmDisconnectDetailsSheet()
        },
        [disconnectSession, closeConfirmDisconnectDetailsSheet],
    )

    return (
        <Layout
            safeAreaTestID="ConnectedAppsScreen"
            noMargin
            body={
                <BaseView pt={16}>
                    <BaseView mx={20}>
                        <ConnectedAppsHeader
                            showAddButton={totalSessions > 0}
                        />

                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subTitle">
                            {LL.CONNECTED_APPS_SCREEN_SUBTITLE()}
                        </BaseText>
                        <BaseSpacer height={12} />
                        <BaseText typographyFont="buttonSecondary">
                            {LL.CONNECTED_APPS_SCREEN_DESCRIPTION()}
                        </BaseText>

                        <BaseSpacer height={22} />

                        {totalSessions === 0 && (
                            <>
                                <BaseSpacer height={60} />
                                <EmptyListView />
                            </>
                        )}
                    </BaseView>
                    {accounts.map((account, index) => {
                        if (
                            account.address in connectedApps &&
                            !isEmpty(connectedApps[account.address])
                        ) {
                            const accountSessions =
                                connectedApps[account.address]

                            return (
                                <BaseView key={account.address}>
                                    <BaseView mx={20}>
                                        {index > 0 && (
                                            <BaseSpacer height={16} />
                                        )}

                                        <BaseText typographyFont="subSubTitle">
                                            {account.alias}
                                        </BaseText>
                                        <BaseSpacer height={16} />
                                    </BaseView>
                                    {accountSessions.map(session => {
                                        return (
                                            <Fragment key={session.topic}>
                                                <SwipeableRow
                                                    item={session}
                                                    itemKey={session.topic}
                                                    swipeableItemRefs={
                                                        swipeableItemRefs
                                                    }
                                                    handleTrashIconPress={
                                                        openConfirmDisconnectDetailsSheet
                                                    }
                                                    setSelectedItem={
                                                        setSessionToDelete
                                                    }
                                                    onPress={(
                                                        _session?: SessionTypes.Struct,
                                                    ) => {
                                                        setSessionToDelete(
                                                            _session,
                                                        )
                                                        openConnectedAppDetailsSheet()
                                                    }}
                                                    isOpen={
                                                        sessionToDelete ===
                                                        session
                                                    }>
                                                    <ConnectedAppBox
                                                        key={session.topic}
                                                        session={session}
                                                    />
                                                </SwipeableRow>
                                                <AppDetailsBottomSheet
                                                    ref={
                                                        connectedAppDetailsBottomSheetRef
                                                    }
                                                    onClose={
                                                        closeConnectedAppDetailsSheet
                                                    }
                                                    session={session}
                                                    account={account}
                                                    onDisconnect={
                                                        openConfirmDisconnectDetailsSheet
                                                    }
                                                />
                                            </Fragment>
                                        )
                                    })}
                                    <ConfirmDisconnectBottomSheet
                                        ref={confirmDisconnectBottomSheetRef}
                                        onCancel={
                                            closeConfirmDisconnectDetailsSheet
                                        }
                                        onConfirm={removeApp}
                                        session={sessionToDelete!}
                                        account={account}
                                    />
                                </BaseView>
                            )
                        }
                    })}
                </BaseView>
            }
        />
    )
}
