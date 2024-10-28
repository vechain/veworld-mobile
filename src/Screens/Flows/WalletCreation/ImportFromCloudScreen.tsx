import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet } from "react-native"

import { StackActions, useNavigation } from "@react-navigation/native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
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
import { useBottomSheetModal, useCheckIdentity, useCloudBackup, useDeviceUtils, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CloudKitWallet, IMPORT_TYPE } from "~Model"
import { selectDevices, selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import { CryptoUtils, error, PasswordUtils, PlatformUtils } from "~Utils"
import { useHandleWalletCreation } from "../Onboarding/WelcomeScreen/useHandleWalletCreation"
import { UserCreatePasswordScreen } from "./UserCreatePasswordScreen"

const skeletonArray = [1, 2, 3, 4]

export const ImportFromCloudScreen = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const nav = useNavigation()
    const theme = useTheme()
    const { getAllWalletFromCloud, getSalt, getIV, deleteWallet } = useCloudBackup()
    const { LL } = useI18nContext()
    const [cloudKitWallets, setCloudKitWallets] = useState<CloudKitWallet[] | null>(null)
    const [selected, setSelected] = useState<CloudKitWallet | null>(null)
    const [selectedToDelete, setSelectedToDelete] = useState<CloudKitWallet | null>(null)
    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
    const { checkCanImportDevice } = useDeviceUtils()
    const devices = useAppSelector(selectDevices)
    const mnemonicCache = useRef<string[]>()

    const [isLoading, setIsLoading] = useState(true)

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
            setIsLoading(true)
            const wallets = await getAllWalletFromCloud()
            setCloudKitWallets(wallets)
            setIsLoading(false)
        }
        init()
    }, [getAllWalletFromCloud])

    const {
        isPasswordPromptOpen: isPasswordPromptOpen,
        handleClosePasswordModal: handleClosePasswordModal,
        onPasswordSuccess: onPasswordSuccess,
        checkIdentityBeforeOpening: checkIdentityBeforeOpening,
    } = useCheckIdentity({
        onIdentityConfirmed: async (pin?: string) => {
            await importOnboardedWallet({
                importMnemonic: mnemonicCache.current,
                importType: PlatformUtils.isIOS() ? IMPORT_TYPE.ICLOUD : IMPORT_TYPE.GOOGLE_DRIVE,
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
                setIsLoading(true)
                const { salt } = await getSalt(selected.rootAddress)
                const { iv } = await getIV(selected.rootAddress)

                if (!salt || !iv) {
                    showErrorToast({
                        text1: LL.CLOUDKIT_ERROR_GENERIC(),
                    })
                    setIsLoading(false)
                    return
                }

                let mnemonic: string[] = []

                try {
                    mnemonic = await CryptoUtils.decrypt(
                        selected.data,
                        password,
                        salt,
                        PasswordUtils.base64ToBuffer(iv),
                    )
                } catch (err) {
                    showErrorToast({
                        text1: LL.ERROR_DECRYPTING_WALLET(),
                    })
                    setIsLoading(false)
                    return
                }

                try {
                    checkCanImportDevice(selected.derivationPath, mnemonic)
                    mnemonicCache.current = mnemonic
                    if (userHasOnboarded) {
                        checkIdentityBeforeOpening()
                    } else {
                        onCreateWallet({
                            importMnemonic: mnemonic,
                            derivationPath: selected.derivationPath,
                            importType: PlatformUtils.isIOS() ? IMPORT_TYPE.ICLOUD : IMPORT_TYPE.GOOGLE_DRIVE,
                        })
                    }
                    setIsLoading(false)
                } catch (_error) {
                    let er = _error as Error
                    error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                    showErrorToast({
                        text1: er.message ?? LL.ERROR_CREATING_WALLET(),
                    })
                    setIsLoading(false)
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
            closeRemoveWalletBottomSheet()
            const wallets = await getAllWalletFromCloud()
            if (!wallets.length) {
                nav.dispatch(StackActions.popToTop())
            } else {
                setCloudKitWallets(wallets)
            }
        }
    }, [closeRemoveWalletBottomSheet, deleteWallet, getAllWalletFromCloud, nav, selectedToDelete])

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
            fixedHeader={
                <BaseText typographyFont="title">
                    {PlatformUtils.isIOS() ? LL.TITLE_IMPORT_WALLET_FROM_ICLOUD() : LL.TITLE_IMPORT_WALLET_FROM_DRIVE()}
                </BaseText>
            }
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
                                        importType: PlatformUtils.isIOS()
                                            ? IMPORT_TYPE.ICLOUD
                                            : IMPORT_TYPE.GOOGLE_DRIVE,
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
