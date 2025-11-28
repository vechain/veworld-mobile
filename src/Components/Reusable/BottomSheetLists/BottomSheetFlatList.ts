import { memo, Ref } from "react"
import { FlatListProps, FlatList as RNFlatList, FlatListProps as RNFlatListProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import { SCROLLABLE_TYPE, BottomSheetFlatListMethods, BottomSheetScrollableProps } from "@gorhom/bottom-sheet"
import { createBottomSheetScrollableComponent } from "../createBottomSheetScrollableComponent"

export type BottomSheetFlatListProps<T> = Omit<
    AnimatedProps<FlatListProps<T>>,
    "decelerationRate" | "onScroll" | "scrollEventThrottle"
> &
    BottomSheetScrollableProps & {
        ref?: Ref<BottomSheetFlatListMethods>
    }

const AnimatedFlatList = Animated.createAnimatedComponent<RNFlatListProps<any>>(RNFlatList)

const BottomSheetFlatListComponent = createBottomSheetScrollableComponent<
    BottomSheetFlatListMethods,
    BottomSheetFlatListProps<any>
>(SCROLLABLE_TYPE.FLATLIST, AnimatedFlatList)

const BottomSheetFlatList = memo(BottomSheetFlatListComponent)
BottomSheetFlatList.displayName = "BottomSheetFlatList"

export default BottomSheetFlatList as <T>(props: BottomSheetFlatListProps<T>) => ReturnType<typeof BottomSheetFlatList>
