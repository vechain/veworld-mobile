import { memo, Ref } from "react"
import { FlatListProps, FlatList as RNFlatList, FlatListProps as RNFlatListProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import {
    BottomSheetFlatListMethods,
    BottomSheetScrollableProps,
    createBottomSheetScrollableComponent,
    SCROLLABLE_TYPE,
} from "@gorhom/bottom-sheet"
import { ignoreContentSize } from "./ignoreContentSize"

export type BottomSheetFlatListProps<T> = Omit<
    AnimatedProps<FlatListProps<T>>,
    "decelerationRate" | "onScroll" | "scrollEventThrottle" | "onContentSizeChange"
> &
    BottomSheetScrollableProps & {
        ref?: Ref<BottomSheetFlatListMethods>
    }

const AnimatedFlatList = Animated.createAnimatedComponent<RNFlatListProps<any>>(RNFlatList)

const BottomSheetFlatListComponent = createBottomSheetScrollableComponent<
    BottomSheetFlatListMethods,
    BottomSheetFlatListProps<any>
>(SCROLLABLE_TYPE.FLATLIST, ignoreContentSize(AnimatedFlatList))

const BottomSheetFlatList = memo(BottomSheetFlatListComponent)
BottomSheetFlatList.displayName = "BottomSheetFlatList"

export default BottomSheetFlatList as <T>(props: BottomSheetFlatListProps<T>) => ReturnType<typeof BottomSheetFlatList>
