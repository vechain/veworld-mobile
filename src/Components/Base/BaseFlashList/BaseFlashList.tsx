import { FlashList, FlashListProps } from "@shopify/flash-list"
import React, { useRef } from "react"
import { PanGestureHandler, ScrollView } from "react-native-gesture-handler"

type BaseFlashListProps<T> = {} & FlashListProps<T>

type flashListPredefinedProps = {
    showsVerticalScrollIndicator?: boolean
    showsHorizontalScrollIndicator?: boolean
    renderScrollComponent?: typeof ScrollView
    estimatedItemSize?: number
}

export function BaseFlashList<T>(props: BaseFlashListProps<T>) {
    const panRef = useRef<FlashList<T> | null>(null)

    const flashListPredefinedProps: flashListPredefinedProps = {
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        renderScrollComponent: ScrollView,
    }
    props = {
        ...props,
        ...flashListPredefinedProps,
    }

    return (
        <PanGestureHandler ref={panRef}>
            <FlashList ref={panRef} {...props}>
                {props.children}
            </FlashList>
        </PanGestureHandler>
    )
}
