import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import {
    AccountIcon,
    AnimatedFloatingButton,
    BackButtonHeader,
    BaseIcon,
    BaseModal,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    CloudKitWarningBottomSheet,
    Layout,
} from "~Components"
import { AnalyticsEvent, ColorThemeType, VET } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useCloudKit, useDeviceUtils, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectHasOnboarded, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils, CryptoUtils, DateUtils } from "~Utils"
import { useHandleWalletCreation } from "../Onboarding/WelcomeScreen/useHandleWalletCreation"
import { UserCreatePasswordScreen } from "./UserCreatePasswordScreen"

type CloudKitWallet = {
    data: string
    rootAddress: string
    walletType: string
    salt: string
    firstAccountAddress: string
    creationDate: number
}

export const ImportFromCloudScreen = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const track = useAnalyticTracking()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { getAllWalletsFromCloudKit, isLoading } = useCloudKit()
    const { LL } = useI18nContext()
    const [CcoudKitWallets, setCloudKitWallets] = useState<CloudKitWallet[] | null>(null)
    const [selected, setSelected] = useState<CloudKitWallet | null>(null)
    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
    const { checkCanImportDevice } = useDeviceUtils()
    const mnemonicCache = useRef<string[]>()

    const {
        onCreateWallet,
        // importOnboardedWallet,
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

    const handleOnPress = useCallback(
        (password: string) => {
            onCloseWarning()
            // TODO-vas - handle if selected is null
            if (selected) {
                const mnemonic = CryptoUtils.decrypt(selected.data, password, selected.salt) as string[]
                const isCloudKit = true
                try {
                    checkCanImportDevice(isCloudKit, mnemonic)
                    mnemonicCache.current = mnemonic
                    track(AnalyticsEvent.IMPORT_MNEMONIC_SUBMITTED)
                    if (userHasOnboarded) {
                        // checkIdentityBeforeOpening_1()
                    } else {
                        onCreateWallet({ importMnemonic: mnemonic, isCloudKit })
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.log(err)
                }
            }
        },
        [checkCanImportDevice, onCloseWarning, onCreateWallet, selected, track, userHasOnboarded],
    )

    //TODO-vas : Add sceleton loader on the flatlist itself
    if (isLoading) return <BaseText>LOADING .....</BaseText>

    return (
        <Layout
            fixedHeader={<BaseText typographyFont="title">{LL.TITLE_IMPORT_WALLET_FROM_ICLOUD()}</BaseText>}
            fixedBody={
                <BaseView flex={1}>
                    {CcoudKitWallets && (
                        <FlatList
                            data={CcoudKitWallets}
                            contentContainerStyle={styles.listContentContainer}
                            ItemSeparatorComponent={() => Seperator}
                            keyExtractor={item => item.rootAddress}
                            renderItem={({ item }) => (
                                <CloudKitWalletCard wallet={item} setSelected={setSelected} selected={selected} />
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    <AnimatedFloatingButton title="Import" extraBottom={24} isVisible={!!selected} onPress={onOpen} />
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
                                        isCloudKit: true,
                                    })
                                }
                            />
                        </BaseView>
                    </BaseModal>
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
