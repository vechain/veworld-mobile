import React, { useCallback, useRef } from "react"
import { StyleSheet } from "react-native"
import { Swipeable } from "react-native-gesture-handler"

type SwipeableProps = {
    renderRightActions: () => React.ReactNode
    onSwipeEnded: () => void
}

/**
 * Custom hook to create swipeable components.
 *
 * @param {Function} renderRightActions - Function that returns the right swipe action component.
 * @param {Function} onSwipeEnded - Callback function that is called when the swipeable component is fully opened.
 *
 * @returns {Object} An object containing the `renderSwipeable` function that takes children as input and returns a swipeable component with the children,
 *                   and the `onClose` function that closes the swipeable component.
 */
export const useSwipeable = ({
    renderRightActions,
    onSwipeEnded,
}: SwipeableProps) => {
    const swipeableRef = useRef<Swipeable>(null)

    const onClose = useCallback(() => {
        swipeableRef.current?.close()
    }, [])

    const handleSwipeableOpen = useCallback(() => {
        onSwipeEnded()
        onClose()
    }, [onClose, onSwipeEnded])

    /**
     * Function to render the swipeable component with the given children.
     *
     * @param {React.ReactNode} children - The children components to be wrapped by the swipeable component.
     *
     * @returns {React.ReactElement} - The swipeable component with the given children.
     */
    const renderSwipeable = (children: React.ReactNode): React.ReactElement => (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            useNativeAnimations
            overshootLeft={false}
            overshootRight={false}
            onSwipeableOpen={handleSwipeableOpen}
            containerStyle={baseStyles.swipeableContainer}>
            {children}
        </Swipeable>
    )

    return { renderSwipeable, onClose }
}

const baseStyles = StyleSheet.create({
    swipeableContainer: { width: "100%" },
})
