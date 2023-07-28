import React, { useCallback, useRef, useState } from "react"
import {
    AccountManagementBottomSheet,
    AddAccountBottomSheet,
    EditTokensBar,
    HeaderView,
    TokenList,
} from "./Components"
import {
    BottomInsetsEXtraPadding,
    useBottomSheetModal,
    useMemoizedAnimation,
    usePlatformBottomInsets,
    useSetSelectedAccount,
} from "~Hooks"
import {
    BaseSafeArea,
    BaseSpacer,
    QRCodeBottomSheet,
    RenameWalletBottomSheet,
    SelectAccountBottomSheet,
    showWarningToast,
} from "~Components"
import { FadeInRight } from "react-native-reanimated"
import { useTokenBalances } from "./Hooks/useTokenBalances"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    removeAccount,
    selectAccounts,
    selectBalanceVisible,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountWithDevice, RENAME_WALLET_TYPE } from "~Model"
import { RemoveAccountWarning } from "~Screens/Flows/App/HomeScreen/Components/BottomSheets/RemoveAccountWarning"
import { AddressUtils } from "~Utils"
import { useI18nContext } from "~i18n"

export const HomeScreen = () => {
    useTokenBalances()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const { tabBarAndroidBottomInsets } = usePlatformBottomInsets()

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

    const accounts = useAppSelector(selectVisibleAccounts)
    const allAccounts = useAppSelector(selectAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const [accountToRemove, setAccountToRemove] = useState<
        AccountWithDevice | undefined
    >(undefined)

    const isOnlyAccount = useCallback(
        (rootAddress: string) => {
            const sameDeviceAccounts = allAccounts.filter(acc =>
                AddressUtils.compareAddresses(acc.rootAddress, rootAddress),
            )

            return sameDeviceAccounts.length <= 1
        },
        [allAccounts],
    )

    const openConfirmRemoveAccountWarning = useCallback(
        (account: AccountWithDevice) => {
            if (isOnlyAccount(account.rootAddress))
                return showWarningToast(
                    LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                )

            setAccountToRemove(account)
            closeRemoveAccountSheet()
            openRemoveAccountWarningBottomSheet()
        },
        [
            LL,
            isOnlyAccount,
            closeRemoveAccountSheet,
            openRemoveAccountWarningBottomSheet,
        ],
    )

    const onRemoveAccount = useCallback(() => {
        closeRemoveAccountWarningBottomSheet()
        openAccountManagementSheet()

        if (!accountToRemove)
            return showWarningToast(LL.NOTIFICATION_FAILED_TO_REMOVE_ACCOUNT())

        if (isOnlyAccount(accountToRemove.rootAddress))
            return showWarningToast(
                LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                undefined,
                undefined,
                undefined,
                10000,
            )

        // [START] - Remove account
        dispatch(removeAccount(accountToRemove))
    }, [
        openAccountManagementSheet,
        dispatch,
        isOnlyAccount,
        closeRemoveAccountWarningBottomSheet,
        accountToRemove,
        LL,
    ])

    const { animateEntering } = useMemoizedAnimation({
        enteringAnimation: new FadeInRight(),
        enteringDelay: 50,
        enteringDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const visibleHeightRef = useRef<number>(0)

    return (
        <BaseSafeArea
            grow={1}
            style={{ marginBottom: tabBarAndroidBottomInsets }}>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <HeaderView
                    openAccountManagementSheet={openAccountManagementSheet}
                    openSelectAccountBottomSheet={openSelectAccountBottomSheet}
                />
                <BaseSpacer height={24} />
                <EditTokensBar isEdit={isEdit} setIsEdit={setIsEdit} />
                <BaseSpacer height={24} />

                <TokenList
                    isEdit={isEdit}
                    visibleHeightRef={visibleHeightRef.current}
                    isBalanceVisible={isBalanceVisible}
                    entering={animateEntering}
                />
                <BaseSpacer height={BottomInsetsEXtraPadding.TabBar} />
            </NestableScrollContainer>

            <AccountManagementBottomSheet
                ref={accountManagementBottomSheetRef}
                onClose={closeAccountManagementSheet}
                openAddAccountSheet={openAddAccountSheet}
                openQRCodeSheet={openQRCodeSheet}
                openRenameAccountBottomSheet={openRenameAccountBottomSheet}
                openRemoveAccountBottomSheet={openRemoveAccountSheet}
            />

            <AddAccountBottomSheet
                ref={addAccountBottomSheetRef}
                onClose={closeAddAccountSheet}
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

            <RemoveAccountWarning
                onClose={openAccountManagementSheet}
                onConfirm={onRemoveAccount}
                ref={removeAccountWarningBottomSheetRef}
            />

            <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />

            <RenameWalletBottomSheet
                type={RENAME_WALLET_TYPE.ACCOUNT}
                ref={renameAccountBottomSheetRef}
                onClose={closeRenameAccountBottonSheet}
            />
        </BaseSafeArea>
    )
}
