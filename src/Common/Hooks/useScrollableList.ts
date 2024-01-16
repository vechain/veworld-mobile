import { useCallback, useMemo, useState } from "react"
import { ViewToken } from "react-native"

/**
 * A custom hook that returns state and configuration
 * for making a list scrollable only when it's fully expanded
 * and there are more items to show.
 *
 * @template T The type of data in the list.
 * @param {T[]} data The array of data to be displayed in the list.
 * @param {number} snapIndex The index of the currently active snap point.
 * @param {number} snapPointsLength The number of snap points defined for the list.
 * @returns {{
 *   isListScrollable: boolean;
 *   viewabilityConfig: { itemVisiblePercentThreshold: number };
 *   onViewableItemsChanged: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
 * }} The state and configuration for the scrollable list.
 */
export const useScrollableList = <T>(
    data: T[],
    snapIndex: number,
    snapPointsLength: number,
) => {
    const [visibleItemsCount, setVisibleItemsCount] = useState<number>(0)

    const isListScrollable = useMemo(
        () =>
            snapIndex === snapPointsLength - 1 &&
            visibleItemsCount < data.length,
        [visibleItemsCount, data.length, snapIndex, snapPointsLength],
    )

    const viewabilityConfig = useMemo(
        () => ({
            itemVisiblePercentThreshold: 50,
        }),
        [],
    )

    const onViewableItemsChanged = useCallback(
        (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
            setVisibleItemsCount(info.viewableItems.length)
        },
        [],
    )

    return {
        isListScrollable,
        viewabilityConfig,
        onViewableItemsChanged,
    }
}
