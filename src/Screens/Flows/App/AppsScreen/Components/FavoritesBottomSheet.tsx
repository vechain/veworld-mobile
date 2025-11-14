import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import DraggableFlatList, { RenderItem, ScaleDecorator } from "react-native-draggable-flatlist"
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
import { Routes } from "~Navigation"

type Props = {
    onClose: () => void
}

export const FavoritesBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const [isEditingMode, setIsEditingMode] = useState(false)
    const { styles } = useThemedStyles(baseStyles)
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { onDAppPress } = useDAppActions(Routes.APPS)
    const dispatch = useAppDispatch()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const [reorderedDapps, setReorderedDapps] = useState<DiscoveryDApp[]>(bookmarkedDApps)

    const handleClose = useCallback(() => {
        setIsEditingMode(false)
        onClose()
    }, [onClose])

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
                <ScaleDecorator activeScale={1.05}>
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
                </ScaleDecorator>
            )
        },
        [isEditingMode, handleDAppPress, onLongPressHandler, onMorePress],
    )

    const onSaveReorderedDapps = useCallback(() => {
        dispatch(reorderBookmarks(reorderedDapps))
        setIsEditingMode(false)
    }, [dispatch, reorderedDapps])

    useEffect(() => {
        setReorderedDapps(bookmarkedDApps)
    }, [bookmarkedDApps])

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
                    <BaseIcon name="icon-star" size={24} color={theme.colors.favoriteHeader} />
                    <BaseText typographyFont="headerTitle">{LL.FAVOURITES_DAPPS_TITLE()}</BaseText>
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
            enableContentPanningGesture={!isEditingMode}
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
                        style={reorderedDapps.length === 0 ? styles.emptyListStyle : undefined}
                        extraData={isEditingMode}
                        data={reorderedDapps}
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
            flexGrow: 1,
            paddingHorizontal: 24,
        },
        layout: {
            backgroundColor: theme.colors.card,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        reorderIcon: {
            borderColor: theme.colors.actionBottomSheet.iconBackground.border,
            backgroundColor: theme.colors.actionBottomSheet.reorderButtonBackground,
            borderWidth: 1,
            borderRadius: 6,
        },
        emptyIcon: {
            backgroundColor: theme.colors.actionBottomSheet.emptyFavoritesIcon.background,
            borderRadius: 100,
            padding: 16,
        },
        emptyListStyle: {
            alignSelf: "center",
        },
    })
