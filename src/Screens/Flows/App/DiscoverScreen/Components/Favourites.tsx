import React, { useCallback, useState } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DAppCard } from "./DAppCard"
import { StackDAppCard } from "./StackDAppCard"
import { StackedDappsBottomSheet } from "./StackedDappsBottomSheet"

type BookmarkListProps = {
    bookmarkedDApps: DiscoveryDApp[][]
    onDAppPress: ({ href, custom }: { href: string; custom?: boolean }) => void
}

const BookmarkedDAppsList = ({ bookmarkedDApps, onDAppPress }: BookmarkListProps) => {
    const [bottomSheetDapps, setBottomSheetDApps] = useState<DiscoveryDApp[]>([])

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const onStackDAppPress = useCallback(
        (dapps: DiscoveryDApp[]) => {
            setBottomSheetDApps(dapps)
            onOpen()
        },
        [onOpen],
    )

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp[]>) => {
            const isLast = index === bookmarkedDApps.length - 1
            const columnsGap = 24

            return (
                <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                    {item.length === 1 ? (
                        <DAppCard
                            columns={4}
                            columnsGap={columnsGap}
                            dapp={item[0]}
                            onPress={() => onDAppPress({ href: item[0].href, custom: item[0].isCustom })}
                        />
                    ) : (
                        <StackDAppCard
                            columns={4}
                            columnsGap={columnsGap}
                            dapp={item}
                            onPress={() => onStackDAppPress(item)}
                        />
                    )}
                </BaseView>
            )
        },
        [bookmarkedDApps.length, onDAppPress, onStackDAppPress],
    )

    return (
        <BaseView>
            <BaseSpacer height={12} />
            <FlatList
                data={bookmarkedDApps}
                horizontal
                keyExtractor={(_item, index) => _item[0]?.href ?? index.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
            <StackedDappsBottomSheet ref={ref} dapps={bottomSheetDapps} onDAppPress={onDAppPress} onClose={onClose} />
        </BaseView>
    )
}

type FavouritesProps = {
    bookmarkedDApps: DiscoveryDApp[][]
    onActionLabelPress: () => void
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
}

export const Favourites = React.memo(({ bookmarkedDApps, onActionLabelPress, onDAppPress }: FavouritesProps) => {
    const { LL } = useI18nContext()
    const showBookmarkedDAppsList = bookmarkedDApps.length > 0

    return (
        <BaseView py={24}>
            <BaseView flexDirection="row" justifyContent="space-between" px={24}>
                <BaseText typographyFont="bodyBold">{LL.DISCOVER_TAB_FAVOURITES()}</BaseText>

                {showBookmarkedDAppsList && (
                    <BaseTouchable action={onActionLabelPress}>
                        <BaseText typographyFont="body">{LL.DISCOVER_SEE_ALL_BOOKMARKS()}</BaseText>
                    </BaseTouchable>
                )}
            </BaseView>

            {showBookmarkedDAppsList && (
                <BookmarkedDAppsList bookmarkedDApps={bookmarkedDApps.slice(0, 5)} onDAppPress={onDAppPress} />
            )}
        </BaseView>
    )
})
