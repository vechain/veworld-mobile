import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import {
    DragEndParams,
    NestableDraggableFlatList,
    NestableScrollContainer,
    RenderItem,
} from "react-native-draggable-flatlist"
import {
    AnimatedSaveHeaderButton,
    BaseBottomSheet,
    BaseIcon,
    BaseSpacer,
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
            onClose()
        },
        [onDAppPress, onClose],
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

    return (
        <BaseBottomSheet
            ref={ref}
            contentStyle={styles.bottomSheetContent}
            leftElement={
                <BaseView style={styles.leftElement}>
                    <BaseIcon name="icon-star" size={24} color={theme.colors.favoriteHeader} />
                </BaseView>
            }
            rightElement={
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
            }
            title={LL.FAVOURITES_DAPPS_TITLE()}
            snapPoints={["90%"]}
            backgroundStyle={styles.layout}
            onDismiss={onClose}>
            <BaseView style={styles.container}>
                <NestableScrollContainer>
                    <NestableDraggableFlatList
                        scrollEnabled={!isEditingMode}
                        contentContainerStyle={styles.listContentContainer}
                        extraData={isEditingMode}
                        data={reorderedDapps}
                        onDragEnd={onDragEnd}
                        keyExtractor={(item, index) => item?.href ?? index.toString()}
                        renderItem={renderItem}
                        ListFooterComponent={renderFooter}
                        showsVerticalScrollIndicator={false}
                        testID="draggable-dapps-list"
                        windowSize={5}
                        activationDistance={isEditingMode ? 10 : 30}
                        ListEmptyComponent={
                            <ListEmptyResults subtitle={LL.FAVOURITES_DAPPS_NO_RECORDS()} icon={"icon-search"} />
                        }
                    />
                </NestableScrollContainer>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        bottomSheetContent: {
            paddingHorizontal: 20,
            paddingBottom: 0,
            color: theme.colors.favoriteHeader,
        },
        leftElement: {
            marginLeft: 8,
        },
        rightElement: {
            marginRight: 8,
        },
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
        },
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        reorderIcon: {
            borderColor: theme.colors.actionBottomSheet.border,
            backgroundColor: theme.colors.actionBottomSheet.iconBackground,
            borderWidth: 1,
            borderRadius: 6,
        },
    })
