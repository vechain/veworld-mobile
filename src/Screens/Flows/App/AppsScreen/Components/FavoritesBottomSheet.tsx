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
import { DiscoveryDApp } from "~Constants"
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

    useEffect(() => {
        if (reorderedDapps.length !== bookmarkedDApps.length) setReorderedDapps(bookmarkedDApps)
    }, [bookmarkedDApps, reorderedDapps.length])

    return (
        <>
            <BaseBottomSheet
                ref={ref}
                floating={false}
                leftElement={
                    <BaseView style={styles.headerContainer}>
                        <BaseView style={styles.headerContent}>
                            <BaseIcon name="icon-star" size={24} color={theme.colors.text} />
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
                                />
                            ) : (
                                <ReorderIconHeaderButton
                                    rounded
                                    action={() => {
                                        setIsEditingMode(true)
                                    }}
                                />
                            )}
                        </BaseView>
                    </BaseView>
                }
                title={LL.FAVOURITES_DAPPS_TITLE()}
                snapPoints={["90%"]}
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
                onNavigateToDApp={() => {
                    setSelectedDApp(undefined)
                    onCloseDAppOptions()
                    ;(ref as any)?.current?.dismiss()
                }}
                selectedDApp={selectedDApp}
                stackBehavior="replace"
            />
        </>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        headerContainer: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
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
    })
