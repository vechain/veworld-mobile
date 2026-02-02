import { StackActions, useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { FlashList, ViewToken } from "@shopify/flash-list"
import * as Haptics from "expo-haptics"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseActivityIndicator,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    ConnectionErrorBottomSheet,
    CreatePasswordModal,
    InfoBottomSheet,
    Layout,
    RequireUserPassword,
    showErrorToast,
} from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType, VETLedgerAccount } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useCheckIdentity, useLedgerDevice, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LedgerAccount, NewLedgerDevice } from "~Model"
import { RootStackParamListCreateWalletApp, RootStackParamListOnboarding, Routes } from "~Navigation"
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import { selectHasOnboarded, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { LedgerUtils } from "~Utils"
import LedgerAccountBox from "../components/LedgerAccountBox"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS
>

export const SelectLedgerAccounts: React.FC<Props> = ({ route }) => {
    const { device } = route.params
    const { LL } = useI18nContext()
    const { styles: themedStyles, theme } = useThemedStyles(styles)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const track = useAnalyticTracking()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const nav = useNavigation()

    const { errorCode, rootAccount, disconnectLedger } = useLedgerDevice({
        deviceId: device.id,
    })
    const [rootAcc, setRootAcc] = useState<VETLedgerAccount | undefined>(
        rootAccount ? ({ ...rootAccount } as VETLedgerAccount) : undefined,
    )

    useEffect(() => {
        // root account will be undefined if the user disconnects. We don't care about that, we only want to read it
        if (rootAccount) {
            setRootAcc({ ...rootAccount })
        }
    }, [rootAccount])

    const ledgerErrorCode = useMemo(() => {
        if (rootAcc) return undefined
        if (!errorCode) return undefined
        return errorCode
    }, [errorCode, rootAcc])

    const { ref, onOpen, onClose } = useBottomSheetModal()
    const {
        onCreateLedgerWallet,
        isOpen,
        onClose: onCloseCreateFlow,
        onLedgerPinSuccess,
        importLedgerWallet,
    } = useHandleWalletCreation()

    useEffect(() => {
        if (ledgerErrorCode) {
            onOpen()
        } else {
            onClose()
        }
    }, [ledgerErrorCode, onClose, onOpen])

    const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([])
    const [ledgerAccountsLoading, setLedgerAccountsLoading] = useState(false)
    const [selectedAccountsIndex, setSelectedAccountsIndex] = useState<number[]>([])
    const [isScrollable, setIsScrollable] = useState(false)
    const ledgerCache = useRef<NewLedgerDevice | null>(null)

    const { ref: infoBottomSheetRef, onOpenPlain: onOpenInfoBottomSheet } = useBottomSheetModal()

    const {
        isPasswordPromptOpen: isPasswordPromptOpen_1,
        handleClosePasswordModal: handleClosePasswordModal_1,
        onPasswordSuccess: onPasswordSuccess_1,
        checkIdentityBeforeOpening: checkIdentityBeforeOpening_1,
    } = useCheckIdentity({
        onIdentityConfirmed: async () => {
            if (!ledgerCache.current) return

            await importLedgerWallet({
                newLedger: ledgerCache.current,
                disconnectLedger,
            })

            // Navigate back to the wallet management screen
            const popAction = StackActions.pop(3)
            nav.dispatch(popAction)
        },
        allowAutoPassword: false,
    })

    useEffect(() => {
        // Disconnect ledger when the component unmounts to avoid crashing the app when a user navigates back
        return () => {
            disconnectLedger()
        }
    }, [disconnectLedger])

    const onConfirm = useCallback(async () => {
        try {
            track(AnalyticsEvent.IMPORT_HW_USER_SUBMITTED_ACCOUNTS)
            if (selectedAccountsIndex.length > 0 && rootAcc) {
                const newLedger = {
                    deviceId: device.id,
                    rootAccount: rootAcc,
                    alias: device.localName,
                    accounts: selectedAccountsIndex,
                }

                ledgerCache.current = newLedger

                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateLedgerWallet({
                        newLedger,
                        disconnectLedger,
                    })
                }
            }
        } catch (e) {
            track(AnalyticsEvent.IMPORT_HW_FAILED_TO_IMPORT)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            showErrorToast({ text1: e as string })
        }
    }, [
        track,
        selectedAccountsIndex,
        rootAcc,
        device.id,
        device.localName,
        userHasOnboarded,
        checkIdentityBeforeOpening_1,
        onCreateLedgerWallet,
        disconnectLedger,
    ])

    /**
     * When the root account changes, fetch the accounts and balances
     */
    useEffect(() => {
        const getLedgerAccounts = async () => {
            if (rootAccount) {
                setLedgerAccountsLoading(true)
                const accounts = await LedgerUtils.getAccountsWithBalances(rootAccount, selectedNetwork, 20)
                setLedgerAccounts(accounts)
            }
            setLedgerAccountsLoading(false)
        }
        getLedgerAccounts()
    }, [rootAccount, selectedNetwork])

    const renderItem = useCallback(
        ({ item, index }: { item: LedgerAccount; index: number }) => {
            const isSelected = selectedAccountsIndex.some(ind => ind === index)

            const onAccountClick = () => {
                setSelectedAccountsIndex(prev => {
                    const alreadySelected = prev.findIndex(ind => ind === index)
                    if (alreadySelected >= 0) {
                        return prev.filter(ind => index !== ind)
                    } else {
                        return [...prev, index]
                    }
                })
            }

            return (
                <LedgerAccountBox
                    account={item}
                    index={index}
                    isSelected={isSelected}
                    onAccountClick={onAccountClick}
                />
            )
        },
        [selectedAccountsIndex],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setIsScrollable(viewableItems.length < ledgerAccounts.length)
        },
        [ledgerAccounts.length],
    )

    return (
        <Layout
            safeAreaTestID="Select_Ledger_Accounts_Screen"
            beforeNavigating={disconnectLedger}
            title={LL.WALLET_LEDGER_SELECT_DEVICE_TITLE()}
            noStaticBottomPadding
            headerRightElement={
                <BaseIcon
                    name="icon-info"
                    size={20}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                    onPress={onOpenInfoBottomSheet}
                />
            }
            fixedHeader={
                <BaseView gap={24} pt={16} px={8}>
                    <BaseView flexDirection="row" gap={12}>
                        <BaseView
                            p={12}
                            bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_200}
                            borderRadius={100}>
                            <BaseIcon
                                name="icon-ledger"
                                size={20}
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.PURPLE}
                            />
                        </BaseView>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            align="center"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}>
                            {device.localName}
                        </BaseText>
                    </BaseView>
                    <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE}>
                        {LL.WALLET_LEDGER_SELECT_ACCOUNTS_SB()}
                    </BaseText>
                </BaseView>
            }
            fixedBody={
                <>
                    <ConnectionErrorBottomSheet ref={ref} onDismiss={onClose} error={ledgerErrorCode} />
                    <BaseActivityIndicator isVisible={ledgerAccountsLoading} />
                    <BaseView flexGrow={1} mx={24}>
                        {!!ledgerAccounts.length && (
                            <FlashList
                                data={ledgerAccounts}
                                extraData={selectedAccountsIndex}
                                scrollEnabled={isScrollable}
                                onViewableItemsChanged={checkViewableItems}
                                keyExtractor={item => item.address}
                                ItemSeparatorComponent={renderSeparator}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                estimatedItemSize={100}
                                estimatedListSize={{
                                    height: 184,
                                    width: 152 * ledgerAccounts.length + (ledgerAccounts.length - 1) * 16,
                                }}
                                contentContainerStyle={themedStyles.flashListContent}
                            />
                        )}
                    </BaseView>

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen_1}
                        onClose={handleClosePasswordModal_1}
                        onSuccess={onPasswordSuccess_1}
                    />

                    <CreatePasswordModal
                        isOpen={isOpen}
                        onClose={onCloseCreateFlow}
                        onSuccess={pin => onLedgerPinSuccess({ pin, newLedger: ledgerCache.current, disconnectLedger })}
                    />

                    <InfoBottomSheet
                        bsRef={infoBottomSheetRef}
                        title={LL.BS_INFO_IMPORTING_FROM_LEDGER_TITLE()}
                        description={LL.BS_INFO_IMPORTING_FROM_LEDGER_DESCRIPTION()}
                    />
                </>
            }
            footer={
                <BaseView>
                    <BaseButton
                        action={onConfirm}
                        w={100}
                        title={LL.COMMON_LBL_IMPORT()}
                        isLoading={!rootAcc}
                        disabled={!selectedAccountsIndex.length}
                    />
                </BaseView>
            }
        />
    )
}

const styles = (theme: ColorThemeType) =>
    StyleSheet.create({
        list: { top: 0, flex: 1 },
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
        flashListContent: {
            paddingVertical: 24,
        },
    })
