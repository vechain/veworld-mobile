import React from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { DAppCard } from "./DAppCard"
import { useI18nContext } from "~i18n"

type BookmarkListProps = {
    bookmarkedDApps: DiscoveryDApp[]
    onDAppPress: ({ href, custom }: { href: string; custom?: boolean }) => void
}

const BookmarkedDAppsList = ({ bookmarkedDApps, onDAppPress }: BookmarkListProps) => {
    const renderItem = ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
        const isLast = index === bookmarkedDApps.length - 1
        const columnsGap = 24

        return (
            <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                <DAppCard
                    columns={4}
                    columnsGap={columnsGap}
                    dapp={item}
                    onPress={() => onDAppPress({ href: item.href, custom: item.isCustom })}
                />
            </BaseView>
        )
    }

    return (
        <BaseView>
            <BaseSpacer height={12} />
            <FlatList
                data={bookmarkedDApps}
                horizontal
                keyExtractor={item => item.href}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        </BaseView>
    )
}

type FavouritesProps = {
    bookmarkedDApps: DiscoveryDApp[]
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
                <BookmarkedDAppsList bookmarkedDApps={bookmarkedDApps.slice(0.5)} onDAppPress={onDAppPress} />
            )}
        </BaseView>
    )
})
