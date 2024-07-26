import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import {
    AccountIcon,
    AnimatedFloatingButton,
    BackButtonHeader,
    BaseIcon,
    BaseModal,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    CloudKitWarningBottomSheet,
    Layout,
    RequireUserPassword,
    showErrorToast,
} from "~Components"
import { ColorThemeType, DerivationPath, ERROR_EVENTS, VET } from "~Constants"
import { useBottomSheetModal, useCheckIdentity, useCloudKit, useDeviceUtils, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectDevices, selectHasOnboarded, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils, CryptoUtils, DateUtils, error, PasswordUtils } from "~Utils"
import { useHandleWalletCreation } from "../Onboarding/WelcomeScreen/useHandleWalletCreation"
import { UserCreatePasswordScreen } from "./UserCreatePasswordScreen"
import { StackActions, useNavigation } from "@react-navigation/native"
import { CloudKitWallet } from "~Model"

const skeletonArray = [1, 2, 3, 4]

export const ImportFromCloudScreen = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { getAllWalletsFromCloudKit, isLoading, getSalt, getIV } = useCloudKit()
    const { LL } = useI18nContext()
    const [cloudKitWallets, setCloudKitWallets] = useState<CloudKitWallet[] | null>(null)
    const [selected, setSelected] = useState<CloudKitWallet | null>(null)
    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
    const { checkCanImportDevice } = useDeviceUtils()
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

    return (
        <Layout
            fixedHeader={<BaseText typographyFont="title">{LL.TITLE_IMPORT_WALLET_FROM_ICLOUD()}</BaseText>}
            fixedBody={
                <BaseView flex={1}>
                    {isLoading ? (
                        <FlatList
                            data={skeletonArray}
                            contentContainerStyle={styles.listContentContainer}
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
                                <CloudKitWalletCard wallet={item} setSelected={setSelected} selected={selected} />
                            )}
                            showsVerticalScrollIndicator={false}
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

const CloudKitWalletCard = ({
    wallet,
    setSelected,
    selected,
}: {
    wallet: CloudKitWallet
    setSelected: (wallet: CloudKitWallet | null) => void
    selected: CloudKitWallet | null
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { _getName } = useVns()
    const network = useAppSelector(selectSelectedNetwork)
    const { locale } = useI18nContext()
    const devices = useAppSelector(selectDevices)
    const [isImported, setisImported] = useState(false)

    useEffect(() => {
        devices.forEach(device => {
            if (device.rootAddress === wallet.rootAddress) {
                setisImported(true)
            }
        })
    }, [devices, wallet.rootAddress])

    const [nameOrAddress, setNameOrAddress] = useState(wallet.firstAccountAddress)
    useEffect(() => {
        const init = async () => {
            const _nameOrAddress = await _getName(wallet.firstAccountAddress)
            if (_nameOrAddress.name) {
                setNameOrAddress(_nameOrAddress.name)
            } else {
                setNameOrAddress(AddressUtils.humanAddress(wallet.firstAccountAddress, 4, 6))
            }
        }
        init()
    }, [_getName, wallet.firstAccountAddress])

    const [balance, setBalance] = useState("0")
    useEffect(() => {
        const init = async () => {
            const _balance = await BalanceUtils.getVetAndVthoBalancesFromBlockchain(wallet.firstAccountAddress, network)
            const formattedBalance = BigNutils(_balance.balance).toHuman(VET.decimals).toTokenFormat_string(2)
            setBalance(formattedBalance)
        }
        init()
    }, [network, wallet.firstAccountAddress])

    const [creationDate, setCreationDate] = useState("...")
    useEffect(() => {
        const date = DateUtils.formatDateTime(
            Number(wallet.creationDate.toFixed(0)) * 1000,
            locale,
            getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
        )
        setCreationDate(date)
    }, [locale, wallet.creationDate])

    const onSelectWallet = useCallback(
        (_wallet: CloudKitWallet) => {
            if (selected?.rootAddress === wallet.rootAddress) {
                setSelected(null)
            } else {
                setSelected(_wallet)
            }
        },
        [selected?.rootAddress, setSelected, wallet.rootAddress],
    )

    return (
        <BaseView w={100} flexDirection="row">
            <BaseTouchableBox
                disabled={isImported}
                haptics="Light"
                action={() => onSelectWallet(wallet)}
                justifyContent="space-between"
                containerStyle={[
                    styles.container,
                    selected?.rootAddress === wallet.rootAddress ? styles.selectedContainer : {},
                ]}>
                <BaseView flexDirection="row" pr={10} alignItems="center">
                    <AccountIcon address={wallet.firstAccountAddress} />
                    <BaseSpacer width={12} />

                    <BaseView justifyContent="space-between">
                        <BaseView flexDirection="row">
                            <BaseView alignSelf="flex-start" alignItems="flex-start">
                                <BaseView flexDirection="row" style={styles.icloudTag}>
                                    <BaseIcon
                                        size={18}
                                        name="apple-icloud"
                                        color={theme.colors.textReversed}
                                        style={styles.cloudIcon}
                                    />
                                    <BaseText fontSize={12} color={theme.colors.textReversed}>
                                        {"iCloud"}
                                    </BaseText>
                                </BaseView>
                            </BaseView>

                            {wallet.derivationPath === DerivationPath.ETH && (
                                <>
                                    <BaseSpacer width={4} />
                                    <BaseIcon name="ethereum" size={20} color={theme.colors.primaryDisabled} />
                                </>
                            )}
                        </BaseView>

                        <BaseSpacer height={4} />

                        <BaseText style={styles.address} fontSize={10}>
                            {creationDate}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseView style={styles.rightSubContainer}>
                    <BaseText style={styles.address} fontSize={10}>
                        {nameOrAddress}
                    </BaseText>

                    <BaseSpacer height={4} />
                    <BaseText fontSize={10}>
                        {balance} {VET.symbol.toUpperCase()}
                    </BaseText>
                </BaseView>
            </BaseTouchableBox>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        alreadyImported: {
            backgroundColor: "red",
        },
        wallet: {
            opacity: 0.7,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            flex: 1,
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.border,
        },
        skeletonCard: {
            borderRadius: 16,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        eyeIcon: { marginLeft: 16, flex: 0.1 },

        cloudIcon: {
            marginRight: 4,
        },

        icloudTag: {
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: theme.colors.primary,
        },
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
            paddingHorizontal: 24,
        },
    })
