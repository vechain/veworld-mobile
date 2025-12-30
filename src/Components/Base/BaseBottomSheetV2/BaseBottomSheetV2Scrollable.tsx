import React, { forwardRef, useCallback } from "react"
import { ScrollViewProps } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { ScrollView } from "react-native-gesture-handler"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

type Props = Omit<ScrollViewProps, "onScroll"> & React.RefAttributes<ScrollView>

export const BaseBottomSheetV2Scrollable = forwardRef<ScrollView, Props>(function BaseBottomSheetV2Scrollable(
    { children, ...props },
    ref,
) {
    const { scrollY } = useBaseBottomSheetV2()
    const onScrollOffsetChange = useCallback(
        (scrollOffset: number) => {
            scrollY.value = scrollOffset
        },
        [scrollY],
    )
    return (
        <NestableScrollContainer
            bounces={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            onScrollOffsetChange={onScrollOffsetChange}
            ref={ref}
            {...props}>
            {children}
        </NestableScrollContainer>
    )
})
