import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useState } from "react"
import { ListRenderItemInfo } from "react-native"
import { BaseBottomSheet, BaseSpacer, BaseText, FavoriteDAppCard } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useI18nContext } from "~i18n"

const snapPoints = ["50%", "90%"]

const ItemSeparatorComponent = () => <BaseSpacer height={16} />

type Props = {
    onClose: () => void
    dapps: DiscoveryDApp[]
    onDAppPress: ({ href, custom }: { href: string; custom?: boolean }) => void
}

export const StackedDappsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ dapps, onDAppPress, onClose }, ref) => {
        const { LL } = useI18nContext()
        const [snapIndex, setSnapIndex] = useState<number>(0)

        // The list is scrollable when the bottom sheet is fully expanded
        const isListScrollable = useMemo(() => snapIndex === snapPoints.length - 1, [snapIndex])

        const handleSheetChanges = useCallback((index: number) => {
            setSnapIndex(index)
        }, [])

        const onCardPressHandler = useCallback(
            ({ href, custom }: { href: string; custom?: boolean }) => {
                onClose()
                onDAppPress({ href, custom })
            },
            [onClose, onDAppPress],
        )

        const renderItem = useCallback(
            ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
                return <FavoriteDAppCard dapp={item} onDAppPress={onCardPressHandler} />
            },
            [onCardPressHandler],
        )

        return (
            <BaseBottomSheet snapPoints={snapPoints} ref={ref} onChange={handleSheetChanges}>
                <BaseText typographyFont="subTitleBold">{LL.FAVOURITES_BOTTOM_SHEET_TITLE()}</BaseText>
                <BaseSpacer height={12} />
                <BottomSheetFlatList
                    data={dapps}
                    keyExtractor={(_item, index) => index.toString()}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={isListScrollable}
                />
            </BaseBottomSheet>
        )
    },
)
