import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseRadioGroup, BaseSpacer, BaseText, BaseView, RadioButton } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { UseDappsWithPaginationSortKey } from "~Hooks/useDappsWithPagination"
import { useI18nContext } from "~i18n"
export type SortableKeys = "asc" | "desc" | "newest"

type Props = {
    selectedSort: UseDappsWithPaginationSortKey
    onSortChange: (sort: UseDappsWithPaginationSortKey) => void
}

export const SortDAppsBottomSheetV2 = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ selectedSort, onSortChange }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const { LL } = useI18nContext()
        const buttons: RadioButton<UseDappsWithPaginationSortKey>[] = useMemo(
            () => [
                {
                    id: "alphabetic_asc",
                    label: LL.BTN_ALPHABETIC_ASC(),
                    disabled: false,
                },
                {
                    id: "alphabetic_desc",
                    label: LL.BTN_ALPHABETIC_DESC(),
                    disabled: false,
                },
                {
                    id: "newest",
                    label: LL.BTN_NEWEST(),
                    disabled: false,
                },
            ],
            [LL],
        )

        const onRadioElementSelected = useCallback(
            (item: RadioButton<UseDappsWithPaginationSortKey>) => {
                onSortChange(item.id)
            },
            [onSortChange],
        )

        return (
            <BaseBottomSheet
                ref={ref}
                dynamicHeight
                bottomSafeArea
                blurBackdrop
                enablePanDownToClose={false}
                backgroundStyle={styles.layout}
                floating>
                <BaseView style={styles.container}>
                    <BaseView flexDirection="row" style={styles.titleContainer}>
                        <BaseIcon name="icon-sort-desc" size={20} color={theme.colors.text} />
                        <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_SORT_BY()}</BaseText>
                    </BaseView>
                    <BaseRadioGroup
                        buttons={buttons}
                        selectedId={selectedSort}
                        isBottomSheet
                        dot={false}
                        action={onRadioElementSelected}
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
        },
        container: {
            gap: 16,
        },
        titleContainer: {
            gap: 12,
        },
    })
