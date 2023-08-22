import { FlashList, FlashListProps } from "@shopify/flash-list"
import React from "react"

type BaseFlashListProps<T> = {} & FlashListProps<T>

export function BaseFlashList<T>(props: BaseFlashListProps<T>) {
    const flashListPredefinedProps = {
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
    }
    props = {
        ...props,
        ...flashListPredefinedProps,
    }

    return <FlashList {...props}>{props.children}</FlashList>
}
