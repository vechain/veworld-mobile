import React, { useCallback, useMemo, useRef } from "react"
import {
    BaseText,
    BaseView,
    BaseSpacer,
    useWalletConnect,
    Layout,
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
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import { UnderlayLeft } from "../../ContactsScreen"
import { useBottomSheetModal } from "~Hooks"
import { isSmallScreen } from "~Constants"

const underlaySnapPoints = [58]

export const ConnectedAppsScreen = () => {
    const activeSessions: Record<string, SessionTypes.Struct[]> =
        useAppSelector(selectSessions)
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const { disconnect } = useWalletConnect()

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

    const closeOtherSwipeableItems = useCallback((currentTopic: string) => {
        swipeableItemRefs?.current.forEach((ref, topic) => {
            if (topic !== currentTopic) {
                ref?.close()
            }
        })
    }, [])

    const onSwipeableItemChange = useCallback(() => {
        // Close all the swipable items
        closeOtherSwipeableItems("")
        // Trigger the disconnect for the item that was swiped
        openConfirmDisconnectDetailsSheet()
    }, [closeOtherSwipeableItems, openConfirmDisconnectDetailsSheet])

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
    )

    const registerSwipeableItemRef = useCallback(
        (address: string, ref: SwipeableItemImperativeRef | null) => {
            if (ref) swipeableItemRefs.current.set(address, ref)
        },
        [],
    )

    const renderConnectedApps = useMemo(() => {
        return accounts.map((account, index) => {
            if (
                account.address in activeSessions &&
                !isEmpty(activeSessions[account.address])
            ) {
                return (
                    <BaseView key={account.address}>
                        {index > 0 && <BaseSpacer height={16} />}

                        <BaseText typographyFont="subSubTitle">
                            {account.alias}
                        </BaseText>
                        <BaseSpacer height={16} />
                        {activeSessions[account.address].map(session => {
                            return (
                                <BaseView key={session.topic}>
                                    <SwipeableItem
                                        ref={ref =>
                                            registerSwipeableItemRef(
                                                session.topic,
                                                ref,
                                            )
                                        }
                                        key={session.topic}
                                        item={session}
                                        onChange={({ openDirection }) => {
                                            if (
                                                openDirection !==
                                                OpenDirection.NONE
                                            ) {
                                                onSwipeableItemChange()
                                            }
                                        }}
                                        renderUnderlayLeft={() => (
                                            <UnderlayLeft
                                                onDelete={() =>
                                                    openConfirmDisconnectDetailsSheet()
                                                }
                                            />
                                        )}
                                        snapPointsLeft={underlaySnapPoints}>
                                        <ConnectedAppBox
                                            key={session.topic}
                                            session={session}
                                            account={account}
                                        />
                                    </SwipeableItem>

                                    <ConfirmDisconnectBottomSheet
                                        ref={confirmDisconnectBottomSheetRef}
                                        onCancel={
                                            closeConfirmDisconnectDetailsSheet
                                        }
                                        onConfirm={topic => disconnect(topic)}
                                        session={session}
                                        account={account}
                                    />
                                </BaseView>
                            )
                        })}
                    </BaseView>
                )
            }
        })
    }, [
        accounts,
        activeSessions,
        onSwipeableItemChange,
        registerSwipeableItemRef,
        confirmDisconnectBottomSheetRef,
        closeConfirmDisconnectDetailsSheet,
        disconnect,
        openConfirmDisconnectDetailsSheet,
    ])

    return (
        <Layout
            safeAreaTestID="ConnectedAppsScreen"
            isScrollEnabled={isSmallScreen}
            body={
                <BaseView pt={16}>
                    <ConnectedAppsHeader showAddButton={totalSessions > 0} />

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

                    <BaseView>{renderConnectedApps}</BaseView>
                </BaseView>
            }
        />
    )
}
