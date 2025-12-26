import React, { PropsWithChildren, useCallback } from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

export const BaseBottomSheetV2Scrollable = ({ children }: PropsWithChildren) => {
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
            onScrollOffsetChange={onScrollOffsetChange}>
            {children}
        </NestableScrollContainer>
    )
}
