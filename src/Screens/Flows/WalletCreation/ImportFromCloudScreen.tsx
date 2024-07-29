import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet } from "react-native"

import {
    AnimatedFloatingButton,
    BackButtonHeader,
    BaseModal,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseView,
    CloudKitWalletCard,
    CloudKitWarningBottomSheet,
    DeleteCloudKitWalletBottomSheet,
    Layout,
    RequireUserPassword,
    showErrorToast,
    SwipeableRow,
} from "~Components"
import { ERROR_EVENTS } from "~Constants"
import { useBottomSheetModal, useCheckIdentity, useCloudKit, useDeviceUtils, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectDevices, selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import { CryptoUtils, error, PasswordUtils } from "~Utils"
import { useHandleWalletCreation } from "../Onboarding/WelcomeScreen/useHandleWalletCreation"
import { UserCreatePasswordScreen } from "./UserCreatePasswordScreen"
import { StackActions, useNavigation } from "@react-navigation/native"
import { CloudKitWallet } from "~Model"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"

const skeletonArray = [1, 2, 3, 4]

export const ImportFromCloudScreen = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const nav = useNavigation()
    const theme = useTheme()
    const { getAllWalletsFromCloudKit, isLoading, getSalt, getIV, deleteWallet } = useCloudKit()
    const { LL } = useI18nContext()
    const [cloudKitWallets, setCloudKitWallets] = useState<CloudKitWallet[] | null>(null)
    const [selected, setSelected] = useState<CloudKitWallet | null>(null)
    const [selectedToDelete, setSelectedToDelete] = useState<CloudKitWallet | null>(null)
    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
    const { checkCanImportDevice } = useDeviceUtils()
    const devices = useAppSelector(selectDevices)
    const mnemonicCache = useRef<string[]>()

    const {
        onCreateWallet,
        importOnboardedWallet,
        isOpen,
        isError: isCreateError,
        onSuccess,
        onClose: onCloseCreateFlow,
    } = useHandleWalletCreation()

    const Seperator = useMemo(() => <BaseSpacer height={16} />, [])
    const variableSeperator = useCallback((height: number) => <BaseSpacer height={height} />, [])

    useEffect(() => {
        const init = async () => {
            const wallets = await getAllWalletsFromCloudKit()
            setCloudKitWallets(wallets)
        }
        init()
    }, [getAllWalletsFromCloudKit])

    const {
        isPasswordPromptOpen: isPasswordPromptOpen,
        handleClosePasswordModal: handleClosePasswordModal,
        onPasswordSuccess: onPasswordSuccess,
        checkIdentityBeforeOpening: checkIdentityBeforeOpening,
    } = useCheckIdentity({
        onIdentityConfirmed: async (pin?: string) => {
            await importOnboardedWallet({
                importMnemonic: mnemonicCache.current,
                isCloudKit: true,
                pin,
                derivationPath: selected!.derivationPath,
            })
            nav.dispatch(StackActions.popToTop())
        },
        allowAutoPassword: false,
    })

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
    // - [END] - Swippable Actions

    const handleOnPress = useCallback(
        async (password: string) => {
            onCloseWarning()

            if (selected) {
                const { salt } = await getSalt(selected.rootAddress)
                const { iv } = await getIV(selected.rootAddress)

                if (!salt || !iv) {
                    showErrorToast({
                        text1: LL.CLOUDKIT_ERROR_GENERIC(),
                    })
                    return
                }

                let mnemonic: string[] = []

                try {
                    mnemonic = CryptoUtils.decrypt(
                        selected.data,
                        password,
                        salt,
                        PasswordUtils.base64ToBuffer(iv),
                    ) as string[]
                } catch (err) {
                    showErrorToast({
                        text1: LL.ERROR_DECRYPTING_WALLET(),
                    })
                    return
                }

                try {
                    const isCloudKit = true
                    checkCanImportDevice(isCloudKit, selected.derivationPath, mnemonic)
                    mnemonicCache.current = mnemonic
                    if (userHasOnboarded) {
                        checkIdentityBeforeOpening()
                    } else {
                        onCreateWallet({
                            importMnemonic: mnemonic,
                            isCloudKit,
                            derivationPath: selected.derivationPath,
                        })
                    }
                } catch (_error) {
                    let er = _error as Error
                    error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                    showErrorToast({
                        text1: er.message ?? LL.CLOUDKIT_ERROR_GENERIC(),
                    })
                }
            } else {
                showErrorToast({
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
            }
        },
        [
            LL,
            checkCanImportDevice,
            checkIdentityBeforeOpening,
            getIV,
            getSalt,
            onCloseWarning,
            onCreateWallet,
            selected,
            userHasOnboarded,
        ],
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
            await deleteWallet(selectedToDelete.rootAddress)
            const wallets = await getAllWalletsFromCloudKit()
            setCloudKitWallets(wallets)
            closeRemoveWalletBottomSheet()
        }
    }, [closeRemoveWalletBottomSheet, deleteWallet, getAllWalletsFromCloudKit, selectedToDelete])

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
            fixedHeader={<BaseText typographyFont="title">{LL.TITLE_IMPORT_WALLET_FROM_ICLOUD()}</BaseText>}
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
                        title="Import"
                        extraBottom={userHasOnboarded ? 0 : 24}
                        isVisible={!!selected}
                        onPress={onOpen}
                        isDisabled={!selected}
                        isLoading={isLoading}
                    />

                    <DeleteCloudKitWalletBottomSheet
                        ref={removeWalletBottomSheetRef}
                        onClose={closeRemoveWalletBottomSheet}
                        onConfirm={handleOnDeleteFromCloud}
                        selectedWallet={selectedToDelete!}
                    />

                    <CloudKitWarningBottomSheet
                        ref={warningRef}
                        onHandleBackupToCloudKit={handleOnPress}
                        openLocation="Import_Screen"
                        rootAddress={selected?.rootAddress}
                    />
                    {!!isCreateError && (
                        <BaseText my={10} color={theme.colors.danger}>
                            {isCreateError}
                        </BaseText>
                    )}
                    <BaseModal isOpen={isOpen} onClose={onCloseCreateFlow}>
                        <BaseView justifyContent="flex-start">
                            <BackButtonHeader action={onCloseCreateFlow} hasBottomSpacer={false} />
                            <UserCreatePasswordScreen
                                onSuccess={pin =>
                                    onSuccess({
                                        pin,
                                        mnemonic: mnemonicCache.current,
                                        isCloudKit: true,
                                        derivationPath: selected!.derivationPath,
                                    })
                                }
                            />
                        </BaseView>
                    </BaseModal>
                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
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
