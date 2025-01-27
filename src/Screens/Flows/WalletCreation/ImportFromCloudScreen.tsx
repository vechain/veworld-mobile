import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet } from "react-native"

import { RouteProp, StackActions, useNavigation, useRoute } from "@react-navigation/native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import {
    AnimatedFloatingButton,
    BaseSkeleton,
    BaseSpacer,
    BaseView,
    CloudKitWalletCard,
    DeleteCloudKitWalletBottomSheet,
    Layout,
    SwipeableRow,
} from "~Components"
import { useBottomSheetModal, useCloudBackup, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CloudKitWallet, DrivetWallet } from "~Model"
import { RootStackParamListOnboarding, Routes } from "~Navigation"
import { selectDevices, selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"

const skeletonArray = [1, 2, 3, 4]

export const ImportFromCloudScreen = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const nav = useNavigation()

    const route = useRoute<RouteProp<RootStackParamListOnboarding, Routes.IMPORT_FROM_CLOUD>>()
    const { wallets } = route.params

    const theme = useTheme()
    const { getAllWalletFromCloud, deleteWallet } = useCloudBackup()
    const { LL } = useI18nContext()
    const [cloudKitWallets, setCloudKitWallets] = useState<CloudKitWallet[] | DrivetWallet[]>(wallets ?? [])
    const [selected, setSelected] = useState<CloudKitWallet | null>(null)
    const [selectedToDelete, setSelectedToDelete] = useState<CloudKitWallet | null>(null)
    const devices = useAppSelector(selectDevices)

    const [isLoading, setIsLoading] = useState(false)

    const Seperator = useMemo(() => <BaseSpacer height={16} />, [])
    const variableSeperator = useCallback((height: number) => <BaseSpacer height={height} />, [])

    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            const _wallets = await getAllWalletFromCloud()
            setCloudKitWallets(_wallets)
            setIsLoading(false)
        }
        cloudKitWallets.length <= 0 && init()
    }, [cloudKitWallets.length, getAllWalletFromCloud])

    // - [START] - Swippable Actions
    const [walletToRemove, setWalletToRemove] = useState<CloudKitWallet>()

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())
    const closeOtherSwipeableItems = useCallback(() => {
        swipeableItemRefs?.current.forEach(ref => {
            ref?.close()
        })
    }, [swipeableItemRefs])

    const {
        ref: removeWalletBottomSheetRef,
        onOpen: openRemoveWalletBottomSheet,
        onClose: closeRemoveWalletBottomSheet,
    } = useBottomSheetModal()

    const onTrashIconPress = useCallback(
        (item: CloudKitWallet) => () => {
            setSelectedToDelete(item)
            openRemoveWalletBottomSheet()
        },
        [openRemoveWalletBottomSheet],
    )

    const onWalletSelected = useCallback(
        (wallet: CloudKitWallet) => {
            closeOtherSwipeableItems()
            if (selected?.rootAddress === wallet.rootAddress) {
                setSelected(null)
            } else {
                setSelected(wallet)
            }
        },
        [closeOtherSwipeableItems, selected?.rootAddress],
    )

    const handleOnDeleteFromCloud = useCallback(async () => {
        if (selectedToDelete) {
            closeRemoveWalletBottomSheet()
            setIsLoading(true)
            await deleteWallet(selectedToDelete.rootAddress)
            const newWallets = cloudKitWallets.filter(w => w.rootAddress !== selectedToDelete.rootAddress)
            setIsLoading(false)
            if (!newWallets.length) {
                nav.dispatch(StackActions.popToTop())
            } else {
                setCloudKitWallets(newWallets)
            }
        }
    }, [closeRemoveWalletBottomSheet, cloudKitWallets, deleteWallet, nav, selectedToDelete])

    const isWalletActive = useCallback(
        (wallet: CloudKitWallet) => devices.find(w => w.rootAddress === wallet.rootAddress),
        [devices],
    )

    const computeButtonPadding = useMemo(() => {
        if (userHasOnboarded && !selected) {
            return 16
        }

        if (userHasOnboarded && !!selected) {
            return 96
        }

        if (!userHasOnboarded && !!selected) {
            return 112
        }

        return 0
    }, [selected, userHasOnboarded])

    return (
        <Layout
            title={PlatformUtils.isIOS() ? LL.TITLE_IMPORT_WALLET_FROM_ICLOUD() : LL.TITLE_IMPORT_WALLET_FROM_DRIVE()}
            fixedBody={
                <BaseView flex={1}>
                    {isLoading ? (
                        <FlatList
                            data={skeletonArray}
                            contentContainerStyle={styles.listContentContainer_Skeleton}
                            ItemSeparatorComponent={() => Seperator}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={() => (
                                <BaseSkeleton
                                    height={74}
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    containerStyle={styles.skeletonCard}
                                    borderRadius={16}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : cloudKitWallets ? (
                        <FlatList
                            data={cloudKitWallets}
                            contentContainerStyle={styles.listContentContainer}
                            ItemSeparatorComponent={() => Seperator}
                            keyExtractor={item => item.rootAddress}
                            renderItem={({ item }) => (
                                <SwipeableRow
                                    item={item}
                                    itemKey={item.rootAddress}
                                    swipeableItemRefs={swipeableItemRefs}
                                    handleTrashIconPress={onTrashIconPress(item)}
                                    setSelectedItem={setWalletToRemove}
                                    swipeEnabled={!isWalletActive(item)}
                                    isLogPressEnabled={!isWalletActive(item)}
                                    onPress={_item => (!isWalletActive(item) ? onWalletSelected(_item) : undefined)}
                                    isOpen={walletToRemove === item}
                                    yMargins={0}>
                                    <CloudKitWalletCard wallet={item} selected={selected} />
                                </SwipeableRow>
                            )}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={variableSeperator(computeButtonPadding)}
                        />
                    ) : null}

                    <AnimatedFloatingButton
                        title={LL.BTN_IMPORT()}
                        extraBottom={userHasOnboarded ? 0 : 24}
                        isVisible={!!selected}
                        onPress={() => {
                            if (selected) {
                                nav.navigate(Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD, { wallet: selected })
                            }
                        }}
                        isDisabled={!selected}
                        isLoading={isLoading}
                    />

                    <DeleteCloudKitWalletBottomSheet
                        ref={removeWalletBottomSheetRef}
                        onClose={closeRemoveWalletBottomSheet}
                        onConfirm={handleOnDeleteFromCloud}
                        selectedWallet={selectedToDelete!}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    alreadyImported: {
        backgroundColor: "red",
    },
    wallet: {
        opacity: 0.7,
    },
    skeletonCard: {
        borderRadius: 16,
    },
    rightSubContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    eyeIcon: { marginLeft: 16, flex: 0.1 },
    listContentContainer_Skeleton: {
        flexGrow: 1,
        paddingTop: 12,
        paddingHorizontal: 24,
    },
    listContentContainer: {
        flexGrow: 1,
        paddingTop: 12,
    },
})
