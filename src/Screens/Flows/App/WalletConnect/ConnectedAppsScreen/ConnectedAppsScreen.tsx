import React, { useMemo, useRef, useState } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    SwipeableRow,
    useWalletConnect,
} from "~Components"
import {
    ConnectedApp,
    selectAccounts,
    selectSessions,
    useAppSelector,
} from "~Storage/Redux"
import { SessionTypes } from "@walletconnect/types"
import { isEmpty } from "lodash"
import {
    ConfirmDisconnectBottomSheet,
    ConnectedAppBox,
    ConnectedAppsHeader,
    EmptyListView,
} from "./Components"
import { useI18nContext } from "~i18n"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { useBottomSheetModal } from "~Hooks"

export const ConnectedAppsScreen = () => {
    const connectedApps: Record<string, ConnectedApp[]> =
        useAppSelector(selectSessions)
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const { disconnect } = useWalletConnect()
    const [selectedSession, setSelectedSession] =
        useState<SessionTypes.Struct>()

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
                            account.address in connectedApps &&
                            !isEmpty(connectedApps[account.address])
                        ) {
                            const accountSessions = connectedApps[
                                account.address
                            ].map(it => it.session)

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
