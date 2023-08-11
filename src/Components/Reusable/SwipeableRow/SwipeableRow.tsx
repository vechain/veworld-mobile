import React, {
    Dispatch,
    MutableRefObject,
    ReactNode,
    SetStateAction,
    useCallback,
} from "react"
import { BaseView } from "~Components/Base"
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import { DeleteUnderlay } from "../DeleteUnderlay"

type Props<T> = {
    item: T
    index: number
    children: ReactNode
    itemKey: string
    onOpenDeleteItemBottomSheet: () => void
    swipeEnabled?: boolean
    setSelectedItem: Dispatch<SetStateAction<T | undefined>>
    swipeableItemRefs: MutableRefObject<Map<string, SwipeableItemImperativeRef>>
}

// this component is used to wrap the item in the list and uniform the logic with swipeable items
export const SwipeableRow = <T,>({
    item,
    index,
    children,
    itemKey,
    onOpenDeleteItemBottomSheet,
    setSelectedItem,
    swipeableItemRefs,
    swipeEnabled = true,
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
            setSelectedItem(item)
        }
    }

    const onTrashIconPress = useCallback(() => {
        closeOtherSwipeableItems(true) // close all swipeable items
        onOpenDeleteItemBottomSheet()
    }, [closeOtherSwipeableItems, onOpenDeleteItemBottomSheet])

    const customStyle = index === 0 ? { marginTop: 20 } : {}
    return (
        <BaseView flexDirection="row" mx={20} my={8} style={customStyle}>
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
