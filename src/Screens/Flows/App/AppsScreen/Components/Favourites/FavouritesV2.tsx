import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS, DiscoveryDApp } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DAppCardV2 } from "./DAppCardV2"

type BookmarkListProps = {
    bookmarkedDApps: DiscoveryDApp[]
    onDAppPress: (dapp: DiscoveryDApp) => void
    /**
     * Icon background for the dapp card
     */
    iconBg?: string
}

const ItemSeparatorComponent = () => <BaseSpacer width={8} />
const FooterComponent = () => <BaseSpacer width={16} />

const BookmarkedDAppsList = ({ bookmarkedDApps, onDAppPress, iconBg }: BookmarkListProps) => {
    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return (
                <DAppCardV2
                    dapp={item}
                    onPress={() => onDAppPress(item)}
                    showDappTitle={false}
                    iconSize={72}
                    iconBg={iconBg}
                />
            )
        },
        [iconBg, onDAppPress],
    )

    return (
        <FlatList
            data={bookmarkedDApps}
            horizontal
            keyExtractor={(_item, index) => _item?.href ?? index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={FooterComponent}
        />
    )
}

type FavouritesProps = {
    bookmarkedDApps: DiscoveryDApp[]
    onDAppPress: (dapp: DiscoveryDApp) => void
    onActionLabelPress?: () => void
    renderCTASeeAll?: boolean
    style?: StyleProp<ViewStyle>
} & Pick<BookmarkListProps, "iconBg">

export const FavouritesV2 = React.memo(
    ({ bookmarkedDApps, onActionLabelPress, onDAppPress, renderCTASeeAll = true, style, iconBg }: FavouritesProps) => {
        const { LL } = useI18nContext()
        const showBookmarkedDAppsList = bookmarkedDApps.length > 0
        const theme = useTheme()

        const titleTypography = useMemo(
            () => (renderCTASeeAll ? "subSubTitleSemiBold" : ("bodySemiBold" as const)),
            [renderCTASeeAll],
        )

        const titleColor = useMemo(() => {
            if (theme.isDark) return COLORS.GREY_100
            return renderCTASeeAll ? COLORS.GREY_800 : COLORS.PURPLE
        }, [theme.isDark, renderCTASeeAll])

        return (
            <BaseView gap={16} flexDirection="column" style={style}>
                <BaseView flexDirection="row" justifyContent="space-between" px={16} alignItems="center">
                    <BaseText typographyFont={titleTypography} color={titleColor}>
                        {LL.DISCOVER_TAB_FAVOURITES()}
                    </BaseText>

                    {renderCTASeeAll && onActionLabelPress && (
                        <BaseTouchable action={onActionLabelPress}>
                            <BaseView flexDirection="row">
                                <BaseText
                                    typographyFont="buttonMedium"
                                    mx={2}
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.DARK_PURPLE}>
                                    {LL.DISCOVER_SEE_ALL_BOOKMARKS()}
                                </BaseText>
                                <BaseIcon
                                    name="icon-arrow-right"
                                    //This should be 12, but given that we're increasing the font size of the label
                                    //It makes sense to have it set as 14
                                    size={14}
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.DARK_PURPLE}
                                />
                            </BaseView>
                        </BaseTouchable>
                    )}
                </BaseView>

                {showBookmarkedDAppsList && (
                    <BookmarkedDAppsList
                        bookmarkedDApps={renderCTASeeAll ? bookmarkedDApps.slice(0, 15) : bookmarkedDApps}
                        onDAppPress={onDAppPress}
                        iconBg={iconBg}
                    />
                )}
            </BaseView>
        )
    },
)

const styles = StyleSheet.create({
    flatListContainer: {
        paddingLeft: 16,
    },
})
