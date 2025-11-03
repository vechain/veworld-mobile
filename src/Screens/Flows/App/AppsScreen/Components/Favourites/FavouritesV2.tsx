import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import DraggableFlatList, { DragEndParams, RenderItem, ScaleDecorator } from "react-native-draggable-flatlist"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS, ColorThemeType, DiscoveryDApp } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { reorderBookmarks, removeBookmark, useAppDispatch } from "~Storage/Redux"
import { DAppCardV2 } from "./DAppCardV2"

type BookmarkListProps = {
    bookmarkedDApps: DiscoveryDApp[]
    onDAppPress: (dapp: DiscoveryDApp) => void
    onReorder: (data: DiscoveryDApp[]) => void
    isEditMode: boolean
    onEditModeChange: (isEditMode: boolean) => void
    /**
     * Icon background for the dapp card
     */
    iconBg?: string
    /**
     * Padding from the left.
     * @default 16
     */
    padding?: number
}

const ItemSeparatorComponent = () => <BaseSpacer width={8} />

const BookmarkedDAppsList = ({
    bookmarkedDApps,
    onDAppPress,
    onReorder,
    isEditMode,
    onEditModeChange,
    iconBg,
    padding,
}: BookmarkListProps) => {
    const { styles } = useThemedStyles(baseStyles({ padding }))
    const dispatch = useAppDispatch()
    const [_isDragging, setIsDragging] = useState(false)

    const handleLongPress = useCallback(() => {
        if (!isEditMode) {
            onEditModeChange(true)
        }
    }, [isEditMode, onEditModeChange])

    const handleRemove = useCallback(
        (dapp: DiscoveryDApp) => {
            dispatch(removeBookmark(dapp))
        },
        [dispatch],
    )

    const renderItem: RenderItem<DiscoveryDApp> = useCallback(
        ({ item, drag, isActive, getIndex }) => {
            const index = getIndex()
            const animationDirection: 1 | -1 = index !== undefined && index % 2 === 0 ? 1 : -1

            return (
                <ScaleDecorator activeScale={isActive ? 1.1 : 1}>
                    <DAppCardV2
                        dapp={item}
                        onPress={() => !isEditMode && onDAppPress(item)}
                        onLongPress={isEditMode ? drag : handleLongPress}
                        isEditMode={isEditMode}
                        isActive={isActive}
                        onRemove={() => handleRemove(item)}
                        animationDirection={animationDirection}
                        showDappTitle={false}
                        iconSize={72}
                        iconBg={iconBg}
                    />
                </ScaleDecorator>
            )
        },
        [iconBg, onDAppPress, isEditMode, handleLongPress, handleRemove],
    )

    const onDragBegin = useCallback(() => {
        setIsDragging(true)
    }, [])

    const onDragEnd = useCallback(
        ({ data }: DragEndParams<DiscoveryDApp>) => {
            setIsDragging(false)
            onReorder(data)
        },
        [onReorder],
    )

    const FooterComponent = useCallback(() => <BaseSpacer width={padding} />, [padding])

    return (
        <BaseView style={styles.listContainer}>
            <DraggableFlatList
                data={bookmarkedDApps}
                horizontal
                keyExtractor={(_item, index) => _item?.href ?? index.toString()}
                renderItem={renderItem}
                onDragBegin={onDragBegin}
                onDragEnd={onDragEnd}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListFooterComponent={FooterComponent}
                activationDistance={isEditMode ? 10 : undefined}
            />
        </BaseView>
    )
}

type FavouritesProps = {
    bookmarkedDApps: DiscoveryDApp[]
    onDAppPress: (dapp: DiscoveryDApp) => void
    onActionLabelPress?: () => void
    renderCTASeeAll?: boolean
    renderCTADone?: boolean
    style?: StyleProp<ViewStyle>
} & Pick<BookmarkListProps, "iconBg" | "padding">

export const FavouritesV2 = React.memo(
    ({
        bookmarkedDApps,
        onActionLabelPress,
        onDAppPress,
        renderCTASeeAll = true,
        renderCTADone = true,
        style,
        iconBg,
        padding = 16,
    }: FavouritesProps) => {
        const { LL } = useI18nContext()
        const showBookmarkedDAppsList = bookmarkedDApps.length > 0
        const theme = useTheme()
        const dispatch = useAppDispatch()
        const [reorderedDapps, setReorderedDapps] = useState<DiscoveryDApp[]>(bookmarkedDApps)
        const [isEditMode, setIsEditMode] = useState(false)

        useEffect(() => {
            setReorderedDapps(bookmarkedDApps)
        }, [bookmarkedDApps])

        const handleReorder = useCallback(
            (data: DiscoveryDApp[]) => {
                setReorderedDapps(data)
                dispatch(reorderBookmarks(data))
            },
            [dispatch],
        )

        const handleDone = useCallback(() => {
            setIsEditMode(false)
        }, [])

        const titleColor = useMemo(() => {
            if (theme.isDark) return COLORS.GREY_100
            return renderCTASeeAll ? COLORS.GREY_800 : COLORS.DARK_PURPLE
        }, [theme.isDark, renderCTASeeAll])

        const displayedDapps = useMemo(
            () => (renderCTASeeAll ? reorderedDapps.slice(0, 15) : reorderedDapps),
            [renderCTASeeAll, reorderedDapps],
        )

        return (
            <BaseView gap={16} flexDirection="column" style={style}>
                <BaseView flexDirection="row" justifyContent="space-between" px={padding} alignItems="center">
                    <BaseText typographyFont="subSubTitleSemiBold" color={titleColor}>
                        {LL.DISCOVER_TAB_FAVOURITES()}
                    </BaseText>

                    {isEditMode && renderCTADone ? (
                        <BaseTouchable action={handleDone}>
                            <BaseView flexDirection="row">
                                <BaseText
                                    typographyFont="captionMedium"
                                    mx={2}
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.DARK_PURPLE}>
                                    {LL.COMMON_BTN_DONE()}
                                </BaseText>
                            </BaseView>
                        </BaseTouchable>
                    ) : (
                        renderCTASeeAll &&
                        onActionLabelPress && (
                            <BaseTouchable action={onActionLabelPress}>
                                <BaseView flexDirection="row">
                                    <BaseText
                                        typographyFont="captionMedium"
                                        mx={2}
                                        color={theme.isDark ? COLORS.GREY_300 : COLORS.DARK_PURPLE}>
                                        {LL.DISCOVER_SEE_ALL_BOOKMARKS()}
                                    </BaseText>
                                    <BaseIcon
                                        name="icon-arrow-right"
                                        size={14}
                                        color={theme.isDark ? COLORS.GREY_300 : COLORS.DARK_PURPLE}
                                    />
                                </BaseView>
                            </BaseTouchable>
                        )
                    )}
                </BaseView>

                {showBookmarkedDAppsList && (
                    <BookmarkedDAppsList
                        bookmarkedDApps={displayedDapps}
                        onDAppPress={onDAppPress}
                        onReorder={handleReorder}
                        isEditMode={isEditMode}
                        onEditModeChange={setIsEditMode}
                        iconBg={iconBg}
                        padding={padding}
                    />
                )}
            </BaseView>
        )
    },
)

const baseStyles =
    ({ padding }: Pick<FavouritesProps, "padding">) =>
    (_theme: ColorThemeType) =>
        StyleSheet.create({
            flatListContainer: {
                paddingLeft: padding,
                paddingVertical: 8,
            },
            listContainer: {
                position: "relative",
            },
        })
