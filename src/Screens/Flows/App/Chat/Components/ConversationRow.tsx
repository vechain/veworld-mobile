import { useNavigation } from "@react-navigation/native"
// import { Conversation } from "@xmtp/react-native-sdk"
import React, { MutableRefObject, useCallback, useEffect, useState } from "react"
import { AccountIcon, BaseText, BaseView, DeleteUnderlay, EnhancedConversation, useVeChat } from "~Components"
import { Routes } from "~Navigation"
import { deleteConversation, updateConversation, useAppDispatch } from "~Storage/Redux"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"
import SwipeableItem, { OpenDirection, SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { Pressable, StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { DeletedConversationUnderlay, PendingConversationUnderlay } from "./ConversationUnderlay"

interface Props<Swipeable extends boolean> {
    item: EnhancedConversation
    itemKey?: Swipeable extends true ? string : undefined
    swipeableItemRefs?: Swipeable extends true ? MutableRefObject<Map<string, SwipeableItemImperativeRef>> : undefined
    swipeEnabled?: Swipeable
    onPress?: (item: EnhancedConversation) => void
    onDeletePress?: (item: EnhancedConversation) => void
    onAllow?: () => void
    onDeny?: () => void
}

export const ConversationRow: React.FC<Props<boolean>> = ({
    item,
    itemKey,
    swipeEnabled = true,
    swipeableItemRefs,
    onPress,
    onDeletePress,
    onAllow,
    onDeny,
}) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { selectedClient } = useVeChat()
    const [recipientAddr, setRecipientAddr] = useState("")

    const dispatch = useAppDispatch()

    const getRecipientAddr = useCallback(async () => {
        const members = await item.members()
        const recipient = members.find(m => m.addresses[0] !== selectedClient?.address)
        if (recipient) {
            setRecipientAddr(recipient.addresses[0])
        }
    }, [item, selectedClient?.address])

    const goToConversation = () => {
        const currentTimestamp = new Date().getTime()
        dispatch(
            updateConversation({
                topic: item.topic,
                conversation: {
                    updatedAt: currentTimestamp,
                    lastRead: currentTimestamp,
                    unreadMessages: 0,
                },
            }),
        )
        onPress?.(item)
        nav.navigate(Routes.CHAT_CONVERSATION, { recipient: recipientAddr, topic: item.topic })
    }

    const allowConversation = useCallback(() => {
        item.updateConsent("allowed")
        onAllow?.()
    }, [item, onAllow])

    const denyConversation = useCallback(() => {
        item.updateConsent("denied")
        onDeny?.()
    }, [item, onDeny])

    const restoreConversation = useCallback(() => {
        item.updateConsent("allowed")
    }, [item])

    const closeSwipeableItems = useCallback(
        (closeCurrentOne = false) => {
            swipeableItemRefs?.current.forEach((ref, id) => {
                if (closeCurrentOne) {
                    ref?.close()
                } else {
                    if (id !== itemKey) {
                        ref?.close()
                    }
                }
            })
        },
        [itemKey, swipeableItemRefs],
    )

    const handleSwipe = ({ openDirection }: { openDirection: string }) => {
        if (openDirection === OpenDirection.LEFT) {
            closeSwipeableItems()
        }
    }

    const onDeleteConversation = useCallback(() => {
        closeSwipeableItems(true) // close all swipeable items
        dispatch(deleteConversation(item.topic))
        onDeletePress?.(item)
    }, [closeSwipeableItems, dispatch, item, onDeletePress])

    const renderUnderlay = useCallback(() => {
        if (item.state === "unknown")
            return (
                <PendingConversationUnderlay
                    onAcceptConversation={allowConversation}
                    onRejectConversation={denyConversation}
                />
            )
        if (item.state === "allowed")
            return (
                <DeleteUnderlay
                    isObservable={false}
                    touchableComponentStyles={styles.underlayDelete}
                    onPress={onDeleteConversation}
                />
            )

        if (item.state === "denied") return <DeletedConversationUnderlay onPress={restoreConversation} />
    }, [
        allowConversation,
        denyConversation,
        item.state,
        onDeleteConversation,
        restoreConversation,
        styles.underlayDelete,
    ])

    useEffect(() => {
        getRecipientAddr()
    }, [getRecipientAddr])

    return (
        <SwipeableItem
            item={item}
            ref={el => {
                swipeEnabled && el && swipeableItemRefs?.current.set(itemKey!, el)
            }}
            swipeEnabled={swipeEnabled}
            snapPointsLeft={[item.state === "unknown" ? 140 : 58]}
            renderUnderlayLeft={renderUnderlay}
            onChange={handleSwipe}>
            <Pressable
                onPress={goToConversation}
                onPressIn={() => {
                    closeSwipeableItems(false)
                }}
                disabled={item.state === "unknown"}
                style={[styles.rowContainer]}>
                <BaseView flexDirection="column" p={12} justifyContent="space-between">
                    <BaseView flexDirection="row">
                        {/* TODO: add new messages counter and last update timestamp */}
                        <AccountIcon address={recipientAddr} size={36} />
                        <BaseView h={100} flexDirection="column" alignItems="flex-start">
                            <BaseView flexDirection="row" justifyContent="space-between">
                                <BaseText mx={12} typographyFont="subSubTitleMedium">
                                    {humanAddress(recipientAddr)}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                        {item.state !== "unknown" && item.unreadMessages > 0 && (
                            <BaseText style={[styles.unreadBadge]}>{item.unreadMessages}</BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </Pressable>
        </SwipeableItem>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rowContainer: {
            backgroundColor: theme.colors.background,
        },
        stateControlsContainer: {
            paddingStart: 48,
        },
        underlayDelete: {
            borderRadius: 0,
        },
        unreadBadge: {
            backgroundColor: theme.colors.danger,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 20,
        },
    })
