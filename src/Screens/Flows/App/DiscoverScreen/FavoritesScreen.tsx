import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
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
import { reorderBookmarks, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import {
    NestableScrollContainer,
    NestableDraggableFlatList,
    RenderItem,
    DragEndParams,
} from "react-native-draggable-flatlist"
import { useDAppActions } from "./Hooks"
import { DAppOptionsBottomSheet } from "./Components/Bottomsheets"

export const FavouritesScreen = () => {
    const [isEditingMode, setIsEditingMode] = useState(false)
    const [selectedDApp, setSelectedDApp] = useState<DiscoveryDApp | undefined>()

    const { styles } = useThemedStyles(baseStyles)
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

    const renderItem: RenderItem<DiscoveryDApp> = useCallback(
        ({ item, isActive, drag }) => {
            return (
                <FavoriteDAppCard
                    dapp={item}
                    isActive={isActive}
                    isEditMode={isEditingMode}
                    onDAppPress={onDAppPress}
                    onMorePress={onMorePress}
                    onLongPress={isEditingMode ? drag : undefined}
                />
            )
        },
        [isEditingMode, onDAppPress, onMorePress],
    )

    const onDragEnd = useCallback(({ data }: DragEndParams<DiscoveryDApp>) => {
        setReorderedDapps(data)
    }, [])

    const onSaveReorderedDapps = useCallback(() => {
        dispatch(reorderBookmarks(reorderedDapps))
        setIsEditingMode(false)
    }, [dispatch, reorderedDapps])

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
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
        },
    })
