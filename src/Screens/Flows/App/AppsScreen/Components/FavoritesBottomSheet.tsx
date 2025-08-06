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
    FavoriteDAppCard,
    ListEmptyResults,
    ReorderIconHeaderButton,
} from "~Components"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import { useBottomSheetModal, useTheme, useThemedStyles } from "~Hooks"
import { reorderBookmarks, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { DAppOptionsBottomSheet } from "../../DiscoverScreen/Components/Bottomsheets"
import { useDAppActions } from "../../DiscoverScreen/Hooks"

type Props = {
    onClose: () => void
}

export const FavoritesBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const [isEditingMode, setIsEditingMode] = useState(false)
    const [selectedDApp, setSelectedDApp] = useState<DiscoveryDApp | undefined>()

    const { styles } = useThemedStyles(baseStyles)
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { onDAppPress } = useDAppActions()
    const dispatch = useAppDispatch()

    const { ref: dappOptionsRef, onOpen: onOpenDAppOptions, onClose: onCloseDAppOptions } = useBottomSheetModal()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const [reorderedDapps, setReorderedDapps] = useState<DiscoveryDApp[]>(bookmarkedDApps)

    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const onMorePress = useCallback(
        (dapp: DiscoveryDApp) => {
            setSelectedDApp(dapp)
            onOpenDAppOptions()
        },
        [onOpenDAppOptions],
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

    const handleNavigateToDApp = useCallback(() => {
        setSelectedDApp(undefined)
        onCloseDAppOptions()
        if (ref && typeof ref !== "function" && ref.current) {
            ref.current.dismiss()
        }
    }, [onCloseDAppOptions, ref])

    useEffect(() => {
        if (reorderedDapps.length !== bookmarkedDApps.length) setReorderedDapps(bookmarkedDApps)
    }, [bookmarkedDApps, reorderedDapps.length])

    return (
        <>
            <BaseBottomSheet
                ref={ref}
                floating={false}
                contentStyle={styles.bottomSheetContent}
                leftElement={
                    <BaseView style={styles.headerContainer}>
                        <BaseView style={styles.headerContent}>
                            <BaseIcon name="icon-star" size={24} color={theme.colors.favoriteHeader} />
                        </BaseView>
                    </BaseView>
                }
                rightElement={
                    <BaseView style={styles.headerContainer}>
                        <BaseView style={styles.headerContent}>
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
                                    rounded
                                />
                            )}
                        </BaseView>
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
                            activationDistance={isEditingMode ? 10 : 30}
                            ListEmptyComponent={
                                <ListEmptyResults subtitle={LL.FAVOURITES_DAPPS_NO_RECORDS()} icon={"icon-search"} />
                            }
                        />
                    </NestableScrollContainer>
                </BaseView>
            </BaseBottomSheet>
            <DAppOptionsBottomSheet
                ref={dappOptionsRef}
                onClose={() => {
                    setSelectedDApp(undefined)
                    onCloseDAppOptions()
                }}
                onNavigateToDApp={handleNavigateToDApp}
                selectedDApp={selectedDApp}
            />
        </>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        bottomSheetContent: {
            paddingHorizontal: 20,
            color: theme.colors.favoriteHeader,
        },
        headerContainer: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            paddingHorizontal: 8,
        },
        headerContent: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
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
            backgroundColor: theme.colors.actionBottomSheet.iconBackground,
            borderWidth: 0,
        },
    })
