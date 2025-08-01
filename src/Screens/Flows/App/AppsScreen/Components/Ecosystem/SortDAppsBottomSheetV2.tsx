import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseRadioGroup, BaseText, BaseView, RadioButton } from "~Components"
import { ColorThemeType } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { UseDappsWithPaginationSortKey } from "~Hooks/useDappsWithPagination"
import { useI18nContext } from "~i18n"
export type SortableKeys = "asc" | "desc" | "newest"

type Props = {
    selectedSort: UseDappsWithPaginationSortKey
    onSortChange: (sort: UseDappsWithPaginationSortKey) => void
    bsRef: RefObject<BottomSheetModalMethods>
}

export const SortDAppsBottomSheetV2 = ({ selectedSort, onSortChange, bsRef }: Props) => {
    const [internalSort, setInternalSort] = useState<UseDappsWithPaginationSortKey>(selectedSort)
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onClose } = useBottomSheetModal({ externalRef: bsRef })
    const { LL } = useI18nContext()

    useEffect(() => {
        setInternalSort(selectedSort)
    }, [selectedSort])

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

    const onRadioElementSelected = useCallback((item: RadioButton<UseDappsWithPaginationSortKey>) => {
        setInternalSort(item.id)
    }, [])

    const onApply = useCallback(() => {
        onSortChange(internalSort)
        onClose()
    }, [internalSort, onClose, onSortChange])

    const onCancel = useCallback(() => {
        setInternalSort(selectedSort)
        onClose()
    }, [onClose, selectedSort])

    return (
        <BaseBottomSheet
            ref={bsRef}
            dynamicHeight
            bottomSafeArea={false}
            blurBackdrop
            enablePanDownToClose={false}
            backgroundStyle={styles.layout}
            noMargins
            floating>
            <BaseView gap={24} p={24}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-sort-desc" size={20} color={theme.colors.text} />
                    <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_SORT_BY()}</BaseText>
                </BaseView>
                <BaseRadioGroup
                    buttons={buttons}
                    selectedId={internalSort}
                    isBottomSheet
                    dot={false}
                    action={onRadioElementSelected}
                />
                <BaseView flexDirection="row" gap={16}>
                    <BaseButton variant="outline" action={onCancel} flex={1}>
                        {LL.COMMON_BTN_CANCEL()}
                    </BaseButton>
                    <BaseButton variant="solid" action={onApply} flex={1}>
                        {LL.COMMON_BTN_APPLY()}
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
}
const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
        },
    })
