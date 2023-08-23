import { FlashList, FlashListProps } from "@shopify/flash-list"
import React from "react"
import { ScrollView } from "react-native-gesture-handler"

type flashListPredefinedProps = {
    showsVerticalScrollIndicator?: boolean
    showsHorizontalScrollIndicator?: boolean
    renderScrollComponent?: typeof ScrollView
}

export function BaseFlashList<T>(props: FlashListProps<T>) {
    const flashListPredefinedProps: flashListPredefinedProps = {
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        renderScrollComponent: ScrollView,
    }
    props = {
        ...props,
        ...flashListPredefinedProps,
    }

    return <FlashList {...props}>{props.children}</FlashList>
}
