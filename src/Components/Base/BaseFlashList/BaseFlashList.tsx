import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { FlashList, FlashListProps } from "@shopify/flash-list"
import React from "react"
import { ScrollView } from "react-native-gesture-handler"

type flashListPredefinedProps = {
    showsVerticalScrollIndicator?: boolean
    showsHorizontalScrollIndicator?: boolean
    renderScrollComponent?: typeof ScrollView
}

interface BaseFlashListProps<T> extends FlashListProps<T> {
    modalMethods?: BottomSheetModalMethods
}

export function BaseFlashList<T>(props: BaseFlashListProps<T>) {
    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y
        // You can define a threshold value based on which you determine if it's scrolled to the top
        if (offsetY <= 0) {
            props.modalMethods?.snapToIndex(1)
        }
    }

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
        <FlashList bounces={false} onScroll={handleScroll} {...props}>
            {props.children}
        </FlashList>
    )
}
