import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    AnimatedSaveHeaderButton,
    BaseSpacer,
    BaseView,
    FavoriteDAppCard,
    Layout,
    ListEmptyResults,
    ReorderIconHeaderButton,
} from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { selectBookmarkedDapps, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { groupFavoritesByBaseUrl } from "./utils"
import {
    NestableScrollContainer,
    NestableDraggableFlatList,
    RenderItem,
    DragEndParams,
} from "react-native-draggable-flatlist"
import { DAppOptionsBottomSheet } from "./Components/Bottomsheets"

export const FavouritesScreen = () => {
    const [isEditingMode, setIsEditingMode] = useState(false)
    const [selectedDApp, setSelectedDApp] = useState<DiscoveryDApp | undefined>()

    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const { ref: dappOptionsRef, onOpen: onOpenDAppOptions, onClose: onCloseDAppOptions } = useBottomSheetModal()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])
    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const onDAppPress = useCallback(
        (dapp: DiscoveryDApp) => {
            setSelectedDApp(dapp)
            onOpenDAppOptions()
        },
        [onOpenDAppOptions],
    )

    const dappToShow = useMemo(() => groupFavoritesByBaseUrl(bookmarkedDApps), [bookmarkedDApps])

    const renderItem: RenderItem<DiscoveryDApp[]> = useCallback(
        ({ item, isActive, drag }) => {
            return (
                <FavoriteDAppCard
                    dapp={item[0]}
                    isActive={isActive}
                    isEditMode={isEditingMode}
                    onDAppPress={isEditingMode ? drag : onDAppPress}
                />
            )
        },
        [isEditingMode, onDAppPress],
    )

    const onDragEnd = useCallback((_: DragEndParams<DiscoveryDApp[]>) => {}, [])

    return (
        <Layout
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            title={LL.FAVOURITES_DAPPS_TITLE()}
            headerRightElement={
                isEditingMode ? (
                    <AnimatedSaveHeaderButton
                        action={() => {
                            setIsEditingMode(false)
                        }}
                    />
                ) : (
                    <ReorderIconHeaderButton
                        action={() => {
                            setIsEditingMode(true)
                        }}
                    />
                )
            }
            fixedBody={
                <BaseView flex={1} px={16}>
                    <NestableScrollContainer>
                        <NestableDraggableFlatList
                            contentContainerStyle={styles.listContentContainer}
                            extraData={isEditingMode}
                            data={dappToShow}
                            onDragEnd={onDragEnd}
                            keyExtractor={(item, index) => item[0]?.href ?? index.toString()}
                            renderItem={renderItem}
                            ListFooterComponent={renderFooter}
                            ItemSeparatorComponent={renderSeparator}
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
