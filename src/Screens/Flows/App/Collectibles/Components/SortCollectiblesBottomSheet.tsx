import { BaseBottomSheet, BaseButton, BaseIcon, BaseRadioGroup, BaseView, RadioButton, BaseText } from "~Components"

import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useCallback, useEffect, useMemo, useState } from "react"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"
import { ColorThemeType, SCREEN_HEIGHT } from "~Constants"
import { useThemedStyles } from "~Hooks"

export type SortCollectiblesKeys = "alphabetic_asc" | "alphabetic_desc" | "newest"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
    selectedSort: SortCollectiblesKeys
    onSortChange: (sort: SortCollectiblesKeys) => void
}

export const SortCollectiblesBottomSheet = ({ bsRef, selectedSort, onSortChange }: Props) => {
    const [internalSort, setInternalSort] = useState<SortCollectiblesKeys>(selectedSort)
    const [actionContainerHeight, setActionContainerHeight] = useState(SCREEN_HEIGHT / 2)

    const { styles, theme } = useThemedStyles(baseStyles)
    const { onClose } = useBottomSheetModal({ externalRef: bsRef })
    const { LL } = useI18nContext()

    useEffect(() => {
        setInternalSort(selectedSort)
    }, [selectedSort])

    const buttons: RadioButton<SortCollectiblesKeys>[] = useMemo(
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

    const onRadioElementSelected = useCallback((item: RadioButton<SortCollectiblesKeys>) => {
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

    const calculateActionContainerHeight = (height: number) => {
        setActionContainerHeight(height)
    }

    const snapPoints = useMemo(() => {
        const heightPercentage = (actionContainerHeight * 100) / SCREEN_HEIGHT
        //This will keep the bottom sheet content inside the padding of the bottom sheet
        return [`${Math.ceil(heightPercentage + buttons.length - 1)}%`]
    }, [actionContainerHeight, buttons.length])

    return (
        <BaseBottomSheet
            ref={bsRef}
            snapPoints={snapPoints}
            bottomSafeArea={false}
            blurBackdrop
            enablePanDownToClose={false}
            noMargins
            backgroundStyle={styles.layout}
            floating>
            <BaseView
                gap={24}
                p={24}
                onLayout={event => calculateActionContainerHeight(event.nativeEvent.layout.height)}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-sort-desc" size={20} color={theme.colors.text} />
                    <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_SORT_BY()}</BaseText>
                </BaseView>
                <BaseRadioGroup
                    buttons={buttons}
                    selectedId={internalSort}
                    isBottomSheet
                    dot={"right"}
                    action={onRadioElementSelected}
                />
                <BaseView flexDirection="row" gap={16}>
                    <BaseButton variant="outline" action={onCancel} flex={1} testID="SORT_COLLECTIONS_CANCEL">
                        {LL.COMMON_BTN_CANCEL()}
                    </BaseButton>
                    <BaseButton variant="solid" action={onApply} flex={1} testID="SORT_COLLECTIONS_APPLY">
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
            backgroundColor: theme.colors.newBottomSheet.background,
        },
    })
