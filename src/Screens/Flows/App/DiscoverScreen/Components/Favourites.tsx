import React, { useCallback } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DAppCard } from "./DAppCard"

type BookmarkListProps = {
    bookmarkedDApps: DiscoveryDApp[][]
    onDAppPress: (dapp: DiscoveryDApp) => void
}

const BookmarkedDAppsList = ({ bookmarkedDApps, onDAppPress }: BookmarkListProps) => {
    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp[]>) => {
            const isLast = index === bookmarkedDApps.length - 1
            const columnsGap = 16

            return (
                <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                    <DAppCard dapp={item[0]} onPress={() => onDAppPress(item[0])} />
                </BaseView>
            )
        },
        [bookmarkedDApps.length, onDAppPress],
    )

    return (
        <BaseView>
            <BaseSpacer height={16} />
            <FlatList
                data={bookmarkedDApps}
                horizontal
                keyExtractor={(_item, index) => _item[0]?.href ?? index.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        </BaseView>
    )
}

type FavouritesProps = {
    bookmarkedDApps: DiscoveryDApp[][]
    onActionLabelPress: () => void
    onDAppPress: (dapp: DiscoveryDApp) => void
}

export const Favourites = React.memo(({ bookmarkedDApps, onActionLabelPress, onDAppPress }: FavouritesProps) => {
    const { LL } = useI18nContext()
    const showBookmarkedDAppsList = bookmarkedDApps.length > 0
    const theme = useTheme()

    return (
        <BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_TAB_FAVOURITES()}</BaseText>

                {showBookmarkedDAppsList && (
                    <BaseTouchable action={onActionLabelPress}>
                        <BaseView flexDirection="row">
                            <BaseText typographyFont="captionMedium" mx={2}>
                                {LL.DISCOVER_SEE_ALL_BOOKMARKS()}
                            </BaseText>
                            <BaseIcon name="icon-chevron-right" size={12} color={theme.colors.text} />
                        </BaseView>
                    </BaseTouchable>
                )}
            </BaseView>

            {showBookmarkedDAppsList && (
                <BookmarkedDAppsList bookmarkedDApps={bookmarkedDApps.slice(0, 5)} onDAppPress={onDAppPress} />
            )}
        </BaseView>
    )
})
