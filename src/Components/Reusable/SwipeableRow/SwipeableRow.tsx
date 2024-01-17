import React, { MutableRefObject, ReactNode, useCallback } from "react"
import { BaseView } from "~Components/Base"
import SwipeableItem, { OpenDirection, SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { DeleteUnderlay } from "../DeleteUnderlay"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Pressable, StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"

type Props<T> = {
    item: T
    children: ReactNode
    itemKey: string
    handleTrashIconPress: (item: T) => void
    swipeEnabled?: boolean
    setSelectedItem?: (item: T | undefined) => void
    swipeableItemRefs: MutableRefObject<Map<string, SwipeableItemImperativeRef>>
    testID?: string
    xMargins?: number
    onPress?: (item: T) => void
    isDragMode?: boolean
    isOpen?: boolean
    customUnderlay?: ReactNode
    snapPointsLeft?: number[]
}

// this component is used to wrap the item in the list and uniform the logic with swipeable items
export const SwipeableRow = <T,>({
    item,
    children,
    itemKey,
    handleTrashIconPress,
    setSelectedItem,
    swipeableItemRefs,
    swipeEnabled = true,
    testID,
    xMargins = 20,
    onPress,
    isDragMode,
    isOpen,
    customUnderlay,
    snapPointsLeft,
}: Props<T>) => {
    const { styles } = useThemedStyles(baseStyles)

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
            setSelectedItem?.(item)
        }
        if (openDirection === OpenDirection.NONE) {
            setSelectedItem?.(undefined)
        }
    }

    const onTrashIconPress = useCallback(() => {
        closeSwipeableItems(true) // close all swipeable items
        handleTrashIconPress(item)
    }, [closeSwipeableItems, handleTrashIconPress, item])

    const handleLongPress = useCallback(() => {
        const element = swipeableItemRefs.current.get(itemKey)
        if (element && !isOpen) {
            element.open(OpenDirection.LEFT, -40)
            setTimeout(() => {
                element.close()
                setTimeout(() => {
                    element.open(OpenDirection.LEFT, -40)
                    setTimeout(() => {
                        element.close()
                    }, 100)
                }, 100)
            }, 100)
        }
    }, [isOpen, itemKey, swipeableItemRefs])

    const PressableComponent = isDragMode ? Pressable : TouchableOpacity

    return (
        <BaseView flexDirection="row" mx={xMargins} my={8} testID={testID}>
            <SwipeableItem
                ref={el => {
                    el && swipeableItemRefs.current.set(itemKey, el)
                }}
                swipeEnabled={swipeEnabled}
                item={item}
                renderUnderlayLeft={() => customUnderlay || <DeleteUnderlay onPress={onTrashIconPress} />}
                snapPointsLeft={snapPointsLeft || [58]}
                onChange={handleSwipe}>
                <BaseView style={styles.touchableContainer}>
                    <PressableComponent
                        disabled={isDragMode}
                        onPress={() => onPress?.(item)}
                        onPressIn={() => {
                            closeSwipeableItems(false)
                        }}
                        onLongPress={handleLongPress}>
                        <BaseView>{children}</BaseView>
                    </PressableComponent>
                </BaseView>
            </SwipeableItem>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            overflow: "hidden",
        },
    })
