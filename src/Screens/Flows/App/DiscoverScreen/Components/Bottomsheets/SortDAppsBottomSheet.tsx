import React from "react"
import { BaseBottomSheet, BaseIcon, BaseRadioGroup, BaseSpacer, BaseText, BaseView, RadioButton } from "~Components"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"
export type SortableKeys = "asc" | "desc" | "newest"

type Props = {
    sortedBy: SortableKeys
    onSortChange: (sort: SortableKeys) => void
}

export const SortDAppsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ sortedBy, onSortChange }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const { LL } = useI18nContext()
        const buttons: RadioButton[] = [
            {
                id: "asc",
                label: LL.BTN_ALPHABETIC_ASC(),
                disabled: false,
            },
            {
                id: "desc",
                label: LL.BTN_ALPHABETIC_DESC(),
                disabled: false,
            },
            {
                id: "newest",
                label: LL.BTN_NEWEST(),
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
                        <BaseIcon name="icon-sort-desc" size={18} color={theme.colors.text} />
                        <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_SORT_BY()}</BaseText>
                    </BaseView>
                    <BaseRadioGroup
                        buttons={buttons}
                        selectedId={sortedBy}
                        action={item => {
                            onSortChange(item.id as SortableKeys)
                        }}
                    />
                    <BaseSpacer height={12} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        container: {
            gap: 16,
        },
        titleContainer: {
            gap: 12,
        },
    })
