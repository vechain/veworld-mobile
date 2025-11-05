import React from "react"
import { DefaultSectionT, SectionListData } from "react-native"
import { BaseSpacer } from "~Components/Base"

/**
 * Type for the SectionListSeparator. This type is somehow not exported by react-native at all
 */
export type BaseSectionListSeparatorProps<ItemT = any, SectionT = DefaultSectionT> = {
    highlighted: boolean
    leadingItem?: ItemT
    leadingSection?: SectionListData<ItemT, SectionT>
    trailingItem?: ItemT
    trailingSection?: SectionListData<ItemT, SectionT>
    section: SectionListData<ItemT, SectionT>
}

type Props<ItemT = any, SectionT = DefaultSectionT> = BaseSectionListSeparatorProps<ItemT, SectionT> & {
    /**
     * Spacing between the header and the first item in the section
     */
    headerToItemsHeight: number
    /**
     * Distance between the last item and the header of the next section
     */
    headerToHeaderHeight: number
}

export const SectionListSeparator = <ItemT = any, SectionT = DefaultSectionT>(props: Props<ItemT, SectionT>) => {
    // If leadingItem is present, but trailingSection is null it means that this is the last section
    // that is display, thus it doesn't make sense to have additional space
    if (props.leadingItem && !props.trailingSection) return null
    //If leadingItem is present, it means that it's trying to render the bottom section separator,
    //otherwise it's trying to render the separator between the header and the section
    return props.leadingItem ? (
        <BaseSpacer height={props.headerToHeaderHeight} />
    ) : (
        <BaseSpacer height={props.headerToItemsHeight} />
    )
}
