import { memo, Ref } from "react"
import { SectionList as RNSectionList, SectionListProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import { SCROLLABLE_TYPE, BottomSheetSectionListMethods, BottomSheetScrollableProps } from "@gorhom/bottom-sheet"
import { createBottomSheetScrollableComponent } from "../createBottomSheetScrollableComponent"

type DefaultSectionT = { [key: string]: any }

export type BottomSheetSectionListProps<ItemT, SectionT> = Omit<
    AnimatedProps<SectionListProps<ItemT, SectionT>>,
    "decelerationRate" | "scrollEventThrottle"
> &
    BottomSheetScrollableProps & {
        ref?: Ref<BottomSheetSectionListMethods>
    }

const AnimatedSectionList = Animated.createAnimatedComponent(RNSectionList)

const BottomSheetSectionListComponent = createBottomSheetScrollableComponent<
    BottomSheetSectionListMethods,
    BottomSheetSectionListProps<any, DefaultSectionT>
>(SCROLLABLE_TYPE.SECTIONLIST, AnimatedSectionList)

const BottomSheetSectionList = memo(BottomSheetSectionListComponent)
BottomSheetSectionList.displayName = "BottomSheetSectionList"
export default BottomSheetSectionList as <ItemT, SectionT = DefaultSectionT>(
    props: BottomSheetSectionListProps<ItemT, SectionT>,
) => ReturnType<typeof BottomSheetSectionList>
