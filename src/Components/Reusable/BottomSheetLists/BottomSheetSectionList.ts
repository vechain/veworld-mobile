import { memo, Ref } from "react"
import { SectionList as RNSectionList, SectionListProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import {
    BottomSheetScrollableProps,
    BottomSheetSectionListMethods,
    createBottomSheetScrollableComponent,
    SCROLLABLE_TYPE,
} from "@gorhom/bottom-sheet"
import { ignoreContentSize } from "./ignoreContentSize"

type DefaultSectionT = { [key: string]: any }

export type BottomSheetSectionListProps<ItemT, SectionT> = Omit<
    AnimatedProps<SectionListProps<ItemT, SectionT>>,
    "decelerationRate" | "scrollEventThrottle" | "onContentSizeChange"
> &
    BottomSheetScrollableProps & {
        ref?: Ref<BottomSheetSectionListMethods>
    }

const AnimatedSectionList = Animated.createAnimatedComponent(RNSectionList)

const BottomSheetSectionListComponent = createBottomSheetScrollableComponent<
    BottomSheetSectionListMethods,
    BottomSheetSectionListProps<any, DefaultSectionT>
>(SCROLLABLE_TYPE.SECTIONLIST, ignoreContentSize(AnimatedSectionList))

const BottomSheetSectionList = memo(BottomSheetSectionListComponent)
BottomSheetSectionList.displayName = "BottomSheetSectionList"
export default BottomSheetSectionList as <ItemT, SectionT = DefaultSectionT>(
    props: BottomSheetSectionListProps<ItemT, SectionT>,
) => ReturnType<typeof BottomSheetSectionList>
