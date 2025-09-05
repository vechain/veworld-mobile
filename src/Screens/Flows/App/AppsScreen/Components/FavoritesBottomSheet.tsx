import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Dimensions, StyleSheet } from "react-native"
import DraggableFlatList, { DragEndParams, RenderItem } from "react-native-draggable-flatlist"
import {
    AnimatedSaveHeaderButton,
    BaseBottomSheet,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    ListEmptyResults,
    ReorderIconHeaderButton,
} from "~Components"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { removeBookmark, reorderBookmarks, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useDAppActions } from "../Hooks"
import { FavoriteDAppCard } from "./FavoriteDAppCard"

type Props = {
    onClose: () => void
}

export const FavoritesBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const [isEditingMode, setIsEditingMode] = useState(false)
    const { styles } = useThemedStyles(baseStyles)
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { onDAppPress } = useDAppActions()
    const dispatch = useAppDispatch()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const [reorderedDapps, setReorderedDapps] = useState<DiscoveryDApp[]>(bookmarkedDApps)

    // Calculate minimum height for empty state (90% of screen height minus header)
    const screenHeight = Dimensions.get("window").height
    const emptyStateMinHeight = screenHeight * 0.9 - 120 // 120px approximate header height

    const handleClose = useCallback(() => {
        setIsEditingMode(false)
        setReorderedDapps(bookmarkedDApps)
        onClose()
    }, [onClose, bookmarkedDApps])

    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const onMorePress = useCallback(
        (dapp: DiscoveryDApp, isEditMode: boolean) => {
            if (isEditMode) return
            dispatch(removeBookmark(dapp))
        },
        [dispatch],
    )

    const onLongPress = useCallback(() => {
        if (!isEditingMode) {
            setIsEditingMode(true)
        }
    }, [isEditingMode])

    const onLongPressHandler = useCallback(
        (_dapp: DiscoveryDApp) => {
            if (!isEditingMode) {
                onLongPress()
            }
        },
        [isEditingMode, onLongPress],
    )

    const handleDAppPress = useCallback(
        (dapp: DiscoveryDApp) => {
            onDAppPress(dapp)
            handleClose()
        },
        [onDAppPress, handleClose],
    )

    const renderItem: RenderItem<DiscoveryDApp> = useCallback(
        ({ item, isActive, drag }) => {
            return (
                <FavoriteDAppCard
                    dapp={item}
                    isActive={isActive}
                    isEditMode={isEditingMode}
                    onPress={handleDAppPress}
                    onRightActionPress={onMorePress}
                    onLongPress={onLongPressHandler}
                    onRightActionLongPress={isEditingMode ? drag : undefined}
                    px={0}
                />
            )
        },
        [isEditingMode, handleDAppPress, onLongPressHandler, onMorePress],
    )

    const onDragEnd = useCallback(({ data }: DragEndParams<DiscoveryDApp>) => {
        setReorderedDapps(data)
    }, [])

    const onSaveReorderedDapps = useCallback(() => {
        dispatch(reorderBookmarks(reorderedDapps))
        setIsEditingMode(false)
    }, [dispatch, reorderedDapps])

    useEffect(() => {
        if (reorderedDapps.length !== bookmarkedDApps.length) setReorderedDapps(bookmarkedDApps)
    }, [bookmarkedDApps, reorderedDapps.length])

    const headerContent = useMemo(
        () => (
            <BaseView
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                px={24}
                pt={16}
                pb={24}
                testID="dapps-list-header">
                <BaseView flexDirection="row" gap={16} alignItems="center">
                    <BaseIcon name="icon-star" size={26} color={theme.colors.favoriteHeader} />
                    <BaseText typographyFont="biggerTitleSemiBold">{LL.FAVOURITES_DAPPS_TITLE()}</BaseText>
                </BaseView>
                <BaseView style={styles.rightElement}>
                    {isEditingMode ? (
                        <AnimatedSaveHeaderButton
                            action={onSaveReorderedDapps}
                            buttonTextAfterClick={LL.BTN_ORDER_SAVED()}
                            rounded
                        />
                    ) : (
                        <ReorderIconHeaderButton
                            action={() => {
                                setIsEditingMode(true)
                            }}
                            style={styles.reorderIcon}
                            iconColor={theme.colors.actionBottomSheet.icon}
                            rounded
                        />
                    )}
                </BaseView>
            </BaseView>
        ),
        [LL, isEditingMode, onSaveReorderedDapps, styles.reorderIcon, styles.rightElement, theme.colors],
    )

    return (
        <BaseBottomSheet
            ref={ref}
            enableContentPanningGesture={isEditingMode}
            noMargins
            snapPoints={["90%"]}
            backgroundStyle={styles.layout}
            onDismiss={handleClose}>
            <BaseView style={styles.container}>
                {headerContent}
                <BaseView flex={1}>
                    <DraggableFlatList
                        scrollEnabled={true}
                        contentContainerStyle={styles.listContentContainer}
                        extraData={isEditingMode}
                        data={reorderedDapps}
                        onDragEnd={onDragEnd}
                        keyExtractor={item => item.href}
                        renderItem={renderItem}
                        ListFooterComponent={renderFooter}
                        showsVerticalScrollIndicator={false}
                        testID="draggable-flatlist"
                        activationDistance={10}
                        windowSize={5}
                        ListEmptyComponent={
                            <ListEmptyResults
                                subtitle={LL.FAVOURITES_DAPPS_EMPTY_LIST()}
                                icon={"icon-alert-circle"}
                                iconColor={theme.colors.actionBottomSheet.emptyFavoritesIcon.color}
                                testID="empty-results"
                                minHeight={emptyStateMinHeight}
                                iconStyle={styles.emptyIcon}
                                subtitleColor={theme.colors.actionBottomSheet.subText}
                            />
                        }
                    />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        leftElement: {
            marginLeft: 8,
        },
        rightElement: {
            marginRight: 8,
        },
        listContentContainer: {
            paddingTop: 12,
            paddingHorizontal: 24,
            flexGrow: 1,
        },
        layout: {
            backgroundColor: theme.colors.card,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        reorderIcon: {
            borderColor: theme.colors.actionBottomSheet.iconBackground.border,
            backgroundColor: theme.colors.actionBottomSheet.iconBackground.background,
            borderWidth: 1,
            borderRadius: 6,
        },
        emptyIcon: {
            backgroundColor: theme.colors.actionBottomSheet.emptyFavoritesIcon.background,
            borderRadius: 100,
            padding: 16,
        },
    })
