import React, { MutableRefObject, ReactNode, useCallback } from "react"
import { BaseView } from "~Components/Base"
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
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
    isDragging?: boolean
    isOpen?: boolean
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
    isDragging,
    isOpen,
}: Props<T>) => {
    const { styles } = useThemedStyles(baseStyles)

    const closeOtherSwipeableItems = useCallback(
        (all = false) => {
            swipeableItemRefs?.current.forEach((ref, id) => {
                if (all) {
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
            closeOtherSwipeableItems()
            setSelectedItem?.(item)
        }
        if (openDirection === OpenDirection.NONE) {
            setSelectedItem?.(undefined)
        }
    }

    const onTrashIconPress = useCallback(() => {
        closeOtherSwipeableItems(true) // close all swipeable items
        handleTrashIconPress(item)
    }, [closeOtherSwipeableItems, handleTrashIconPress, item])

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

    const PressableComponent = isDragging ? Pressable : TouchableOpacity

    return (
        <BaseView flexDirection="row" mx={xMargins} my={8} testID={testID}>
            <SwipeableItem
                ref={el => {
                    el && swipeableItemRefs.current.set(itemKey, el)
                }}
                swipeEnabled={swipeEnabled}
                item={item}
                renderUnderlayLeft={() => (
                    <DeleteUnderlay onPress={onTrashIconPress} />
                )}
                snapPointsLeft={[58]}
                onChange={handleSwipe}>
                <BaseView style={styles.touchableContainer}>
                    <PressableComponent
                        onPress={() => onPress?.(item)}
                        onPressIn={() => {
                            closeOtherSwipeableItems(false)
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
