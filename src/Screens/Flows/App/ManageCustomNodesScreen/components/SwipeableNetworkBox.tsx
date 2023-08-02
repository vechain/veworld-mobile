import React from "react"
import { Network } from "~Model"
import SwipeableItem, {
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import { DeleteUnderlay, NetworkBox } from "~Components"

type Props = {
    network: Network
    onPress: () => void
    onSwipe: () => void
    onDelete: () => void
    registerSwipeable: (
        networkId: string,
        ref: SwipeableItemImperativeRef | null,
    ) => void
    closeSwipeables: (closeSelf?: boolean) => void
}

const underlaySnapPoints = [58]

export const SwipeableNetworkBox: React.FC<Props> = ({
    network,
    onPress,
    onDelete,
    onSwipe,
    registerSwipeable,
    closeSwipeables,
}) => {
    return (
        <SwipeableItem
            ref={ref => registerSwipeable(network.id, ref)}
            key={network.id}
            item={network}
            onChange={({ openDirection }) => {
                if (openDirection !== OpenDirection.NONE) {
                    onSwipe()
                    closeSwipeables()
                }
            }}
            renderUnderlayLeft={() => <DeleteUnderlay onPress={onDelete} />}
            snapPointsLeft={underlaySnapPoints}>
            <NetworkBox
                activeOpacity={1}
                flex={1}
                network={network}
                onPress={onPress}
                rightIcon="pencil-outline"
            />
        </SwipeableItem>
    )
}
