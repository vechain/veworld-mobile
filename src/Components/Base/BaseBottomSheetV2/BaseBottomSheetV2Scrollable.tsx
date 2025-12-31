import React, { ReactNode, useCallback } from "react"
import { ScrollViewProps } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { ScrollView } from "react-native-gesture-handler"
import { typedForwardRef } from "~Utils/ReactUtils"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

type Props<TData = unknown> = Omit<ScrollViewProps, "onScroll" | "children"> &
    React.RefAttributes<ScrollView> & {
        children: ReactNode | ((data: TData) => ReactNode)
    }

const _BaseBottomSheetV2Scrollable = <TData,>(
    { children, ...props }: Props<TData>,
    ref: React.ForwardedRef<ScrollView>,
) => {
    const { scrollY, data } = useBaseBottomSheetV2()
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
            {typeof children === "function" ? (data === undefined ? null : children(data as any)) : children}
        </NestableScrollContainer>
    )
}

export const BaseBottomSheetV2Scrollable = typedForwardRef(_BaseBottomSheetV2Scrollable)
