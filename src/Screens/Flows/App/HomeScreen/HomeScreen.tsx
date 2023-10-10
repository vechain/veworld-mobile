import React, { useCallback, useMemo, useRef, useState } from "react"
import {
    AccountManagementBottomSheet,
    EditTokensBar,
    Header,
    TokenList,
    RemoveAccountWarningBottomSheet,
    AccountCard,
} from "./Components"
import {
    useBottomSheetModal,
    useCheckVersion,
    useMemoizedAnimation,
    useSetSelectedAccount,
    useTheme,
} from "~Hooks"
import {
    AddAccountBottomSheet,
    BaseIcon,
    BaseSpacer,
    BaseView,
    FastActionsBar,
    Layout,
    QRCodeBottomSheet,
    RenameAccountBottomSheet,
    SelectAccountBottomSheet,
    showSuccessToast,
    showWarningToast,
} from "~Components"
import { FadeInRight } from "react-native-reanimated"
import { useTokenBalances, useAccountDelete } from "./Hooks"
import {
    selectAccounts,
    selectBalanceVisible,
    selectCurrency,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { AccountWithDevice, FastAction } from "~Model"
import { useI18nContext } from "~i18n"
import { RefreshControl } from "react-native"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { Routes } from "~Navigation"

export const HomeScreen = () => {
    const { updateBalances, updateSuggested } = useTokenBalances()

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { LL } = useI18nContext()
    // Pull down to refresh
    const [refreshing, setRefreshing] = React.useState(false)

    const theme = useTheme()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const {
        ref: accountManagementBottomSheetRef,
        onOpen: openAccountManagementSheet,
        onClose: closeAccountManagementSheet,
    } = useBottomSheetModal()

    const {
        ref: addAccountBottomSheetRef,
        onOpen: openAddAccountSheet,
        onClose: closeAddAccountSheet,
    } = useBottomSheetModal()

    const {
        ref: removeAccountBottomSheetRef,
        onOpen: openRemoveAccountSheet,
        onClose: closeRemoveAccountSheet,
    } = useBottomSheetModal()

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const {
        ref: removeAccountWarningBottomSheetRef,
        onOpen: openRemoveAccountWarningBottomSheet,
        onClose: closeRemoveAccountWarningBottomSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } =
        useBottomSheetModal()

    const {
        ref: renameAccountBottomSheetRef,
        onOpen: openRenameAccountBottomSheet,
        onClose: closeRenameAccountBottonSheet,
    } = useBottomSheetModal()

    const handleOnSuccessAddAccountBottomSheet = useCallback(() => {
        closeAddAccountSheet()
        showSuccessToast({
            text1: LL.WALLET_MANAGEMENT_NOTIFICATION_CREATE_ACCOUNT_SUCCESS(),
        })
    }, [LL, closeAddAccountSheet])

    const accounts = useAppSelector(selectVisibleAccounts)
    const allAccounts = useAppSelector(selectAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { setAccountToRemove, deleteAccount, isOnlyAccount } =
        useAccountDelete()

    const openConfirmRemoveAccountWarning = useCallback(
        (account: AccountWithDevice) => {
            if (isOnlyAccount(account.rootAddress))
                return showWarningToast({
                    text1: LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                })

            setAccountToRemove(account)
            closeRemoveAccountSheet()
            openRemoveAccountWarningBottomSheet()
        },
        [
            setAccountToRemove,
            LL,
            isOnlyAccount,
            closeRemoveAccountSheet,
            openRemoveAccountWarningBottomSheet,
        ],
    )

    const onRemoveAccount = useCallback(() => {
        closeRemoveAccountWarningBottomSheet()
        openAccountManagementSheet()
        deleteAccount()
    }, [
        closeRemoveAccountWarningBottomSheet,
        openAccountManagementSheet,
        deleteAccount,
    ])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await updateBalances()
        await updateSuggested()

        setRefreshing(false)
    }, [updateBalances, updateSuggested])

    const { animateEntering } = useMemoizedAnimation({
        enteringAnimation: new FadeInRight(),
        enteringDelay: 50,
        enteringDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const scrollViewRef = useRef(null)

    useScrollToTop(scrollViewRef)

    useCheckVersion()

    const nav = useNavigation()

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                action: () =>
                    nav.navigate(Routes.SELECT_TOKEN_SEND, {
                        initialRoute: Routes.HOME,
                    }),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
            {
                name: LL.BTN_HISTORY(),
                action: () => nav.navigate(Routes.HISTORY),
                icon: <BaseIcon color={theme.colors.text} name="history" />,
                testID: "historyButton",
            },
        ],
        [LL, nav, theme.colors.text],
    )
    const selectedCurrency = useAppSelector(selectCurrency)

    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            noMargin
            refreshControl={
                <RefreshControl
                    onRefresh={onRefresh}
                    tintColor={theme.colors.border}
                    refreshing={refreshing}
                />
            }
            fixedBody={
                <>
                    <NestableScrollContainer
                        ref={scrollViewRef}
                        testID="HomeScreen_ScrollView">
                        <BaseView>
                            <BaseView alignItems="center">
                                <BaseSpacer height={20} />
                                <AccountCard
                                    balanceVisible={isBalanceVisible}
                                    openAccountManagement={
                                        openAccountManagementSheet
                                    }
                                    openSelectAccountBottomSheet={
                                        openSelectAccountBottomSheet
                                    }
                                    account={selectedAccount}
                                    selectedCurrency={selectedCurrency}
                                />
                            </BaseView>
                            <BaseSpacer height={24} />

                            <FastActionsBar actions={Actions} />

                            <BaseSpacer height={24} />
                            <EditTokensBar
                                isEdit={isEdit}
                                setIsEdit={setIsEdit}
                            />
                            <BaseSpacer height={24} />

                            <TokenList
                                isEdit={isEdit}
                                isBalanceVisible={isBalanceVisible}
                                entering={animateEntering}
                            />
                            <BaseSpacer height={24} />
                        </BaseView>

                        <AccountManagementBottomSheet
                            ref={accountManagementBottomSheetRef}
                            onClose={closeAccountManagementSheet}
                            openAddAccountSheet={openAddAccountSheet}
                            openQRCodeSheet={openQRCodeSheet}
                            openRenameAccountBottomSheet={
                                openRenameAccountBottomSheet
                            }
                            openRemoveAccountBottomSheet={
                                openRemoveAccountSheet
                            }
                        />

                        <AddAccountBottomSheet
                            ref={addAccountBottomSheetRef}
                            onSuccess={handleOnSuccessAddAccountBottomSheet}
                        />

                        {/*Account Selection*/}
                        <SelectAccountBottomSheet
                            closeBottomSheet={closeSelectAccountBottonSheet}
                            accounts={accounts}
                            setSelectedAccount={setSelectedAccount}
                            selectedAccount={selectedAccount}
                            isBalanceVisible={isBalanceVisible}
                            ref={selectAccountBottomSheetRef}
                        />

                        {/*Account Removal*/}
                        <SelectAccountBottomSheet
                            accounts={allAccounts}
                            setSelectedAccount={openConfirmRemoveAccountWarning}
                            isBalanceVisible={isBalanceVisible}
                            onDismiss={closeRemoveAccountSheet}
                            ref={removeAccountBottomSheetRef}
                        />

                        <RemoveAccountWarningBottomSheet
                            onClose={openAccountManagementSheet}
                            onConfirm={onRemoveAccount}
                            ref={removeAccountWarningBottomSheetRef}
                        />

                        <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />

                        <RenameAccountBottomSheet
                            ref={renameAccountBottomSheetRef}
                            account={selectedAccount}
                            onClose={closeRenameAccountBottonSheet}
                        />
                    </NestableScrollContainer>
                </>
            }
        />
    )
}
