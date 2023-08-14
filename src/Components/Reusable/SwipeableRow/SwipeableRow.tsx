import React, { MutableRefObject, ReactNode, useCallback } from "react"
import { BaseView } from "~Components/Base"
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import { DeleteUnderlay } from "../DeleteUnderlay"

type Props<T> = {
    item: T
    children: ReactNode
    itemKey: string
    handleTrashIconPress: (item: T) => void
    swipeEnabled?: boolean
    setSelectedItem?: (item: T) => void
    swipeableItemRefs: MutableRefObject<Map<string, SwipeableItemImperativeRef>>
    testID?: string
    xMargins?: number
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
}: Props<T>) => {
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
    }

    const onTrashIconPress = useCallback(() => {
        closeOtherSwipeableItems(true) // close all swipeable items
        handleTrashIconPress(item)
    }, [closeOtherSwipeableItems, handleTrashIconPress, item])

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
                {children}
            </SwipeableItem>
        </BaseView>
    )
}
