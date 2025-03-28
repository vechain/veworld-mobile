import React from "react"
import { BaseBottomSheet, BaseIcon, BaseRadioGroup, BaseSpacer, BaseText, BaseView, RadioButton } from "~Components"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

type Props = {
    sortBy: string
    onSortChange: (sort: string) => void
}

export const SortDAppsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({}, ref) => {
    const { styles } = useThemedStyles(baseStyles)

    const buttons: RadioButton[] = [
        {
            id: "asc",
            label: "Alphabetic (A-Z)",
            disabled: false,
        },
        {
            id: "desc",
            label: "Alphabetic (Z-A)",
            disabled: false,
        },
        {
            id: "newest",
            label: "Recently added",
            disabled: false,
        },
        {
            id: "popularity",
            label: "Popularity",
            disabled: false,
        },
    ]

    return (
        <BaseBottomSheet
            ref={ref}
            dynamicHeight
            bottomSafeArea
            blurBackdrop
            enablePanDownToClose
            backgroundStyle={styles.layout}>
            <BaseView style={[styles.container]}>
                <BaseView flexDirection="row" style={[styles.titleContainer]}>
                    <BaseIcon name="icon-sort-desc" size={18} />
                    <BaseText typographyFont="bodySemiBold">{"Sort by"}</BaseText>
                </BaseView>
                <BaseRadioGroup buttons={buttons} selectedId={"asc"} action={() => {}} />
                <BaseSpacer height={12} />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        layout: { borderTopRightRadius: 24, borderTopLeftRadius: 24 },
        container: {
            gap: 16,
        },
        titleContainer: {
            gap: 12,
        },
    })
