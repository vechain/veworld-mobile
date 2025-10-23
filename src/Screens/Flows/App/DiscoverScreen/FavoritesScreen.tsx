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
    BaseSpacer,
    BaseText,
    BaseView,
    FavoriteDAppCard,
    Layout,
    ListEmptyResults,
    ReorderIconHeaderButton,
} from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { reorderBookmarks, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { DAppOptionsBottomSheet } from "./Components/Bottomsheets"
import { useDAppActions } from "./Hooks"
import FontUtils from "~Utils/FontUtils"

export const FavouritesScreen = () => {
    const [isEditingMode, setIsEditingMode] = useState(false)
    const [selectedDApp, setSelectedDApp] = useState<DiscoveryDApp | undefined>()

    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { onDAppPress } = useDAppActions(Routes.DISCOVER)
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

    const renderItem: RenderItem<DiscoveryDApp> = useCallback(
        ({ item, isActive, drag }) => {
            return (
                <FavoriteDAppCard
                    dapp={item}
                    isActive={isActive}
                    isEditMode={isEditingMode}
                    onPress={onDAppPress}
                    onRightActionPress={onMorePress}
                    onLongPress={onLongPress}
                    onRightActionLongPress={isEditingMode ? drag : undefined}
                />
            )
        },
        [isEditingMode, onDAppPress, onLongPress, onMorePress],
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
        <Layout
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            title={LL.FAVOURITES_DAPPS_TITLE()}
            headerRightElement={
                isEditingMode ? (
                    <AnimatedSaveHeaderButton action={onSaveReorderedDapps} />
                ) : (
                    <ReorderIconHeaderButton
                        action={() => {
                            setIsEditingMode(true)
                        }}
                    />
                )
            }
            fixedBody={
                <BaseView flex={1}>
                    <BaseView px={16} py={12}>
                        <BaseText typographyFont="bodySemiBold">{`${bookmarkedDApps.length} dApps`}</BaseText>
                    </BaseView>
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
                            ListEmptyComponent={
                                <ListEmptyResults subtitle={LL.FAVOURITES_DAPPS_NO_RECORDS()} icon={"icon-search"} />
                            }
                        />
                    </NestableScrollContainer>
                    <DAppOptionsBottomSheet
                        ref={dappOptionsRef}
                        onClose={() => {
                            setSelectedDApp(undefined)
                            onCloseDAppOptions()
                        }}
                        selectedDApp={selectedDApp}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
            height: 60,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: FontUtils.font(14),
        },
        description: {
            fontSize: FontUtils.font(12),
        },
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
        },
    })
