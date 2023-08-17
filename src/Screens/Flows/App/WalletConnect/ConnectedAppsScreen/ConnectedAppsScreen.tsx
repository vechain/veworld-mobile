import React, { useMemo, useRef, useState } from "react"
import {
    BaseText,
    BaseView,
    BaseSpacer,
    useWalletConnect,
    Layout,
    SwipeableRow,
} from "~Components"
import { useAppSelector, selectSessions, selectAccounts } from "~Storage/Redux"
import { SessionTypes } from "@walletconnect/types"
import { isEmpty } from "lodash"
import {
    EmptyListView,
    ConnectedAppBox,
    ConnectedAppsHeader,
    ConfirmDisconnectBottomSheet,
} from "./Components"
import { useI18nContext } from "~i18n"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { useBottomSheetModal } from "~Hooks"

export const ConnectedAppsScreen = () => {
    const activeSessions: Record<string, SessionTypes.Struct[]> =
        useAppSelector(selectSessions)
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const { disconnect } = useWalletConnect()
    const [selectedSession, setSelectedSession] =
        useState<SessionTypes.Struct>()

    const totalSessions = useMemo(() => {
        return Object.values(activeSessions).reduce(
            (acc, curr) => acc + curr.length,
            0,
        )
    }, [activeSessions])

    const {
        ref: confirmDisconnectBottomSheetRef,
        onOpen: openConfirmDisconnectDetailsSheet,
        onClose: closeConfirmDisconnectDetailsSheet,
    } = useBottomSheetModal()

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
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
                            account.address in activeSessions &&
                            !isEmpty(activeSessions[account.address])
                        ) {
                            const accountSessions =
                                activeSessions[account.address]
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
                                            <SwipeableRow
                                                key={session.topic}
                                                item={session}
                                                itemKey={session.topic}
                                                swipeableItemRefs={
                                                    swipeableItemRefs
                                                }
                                                handleTrashIconPress={
                                                    openConfirmDisconnectDetailsSheet
                                                }
                                                setSelectedItem={
                                                    setSelectedSession
                                                }>
                                                <ConnectedAppBox
                                                    key={session.topic}
                                                    session={session}
                                                    account={account}
                                                />
                                            </SwipeableRow>
                                        )
                                    })}
                                    <ConfirmDisconnectBottomSheet
                                        ref={confirmDisconnectBottomSheetRef}
                                        onCancel={
                                            closeConfirmDisconnectDetailsSheet
                                        }
                                        onConfirm={topic => disconnect(topic)}
                                        session={selectedSession!}
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
