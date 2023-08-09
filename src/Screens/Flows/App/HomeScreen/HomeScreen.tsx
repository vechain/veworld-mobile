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
    RenameAccountBottomSheet,
    SelectAccountBottomSheet,
    showWarningToast,
} from "~Components"
import { FadeInRight } from "react-native-reanimated"
import { useTokenBalances } from "./Hooks/useTokenBalances"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    selectAccounts,
    selectBalanceVisible,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { AccountWithDevice } from "~Model"
import { RemoveAccountWarningBottomSheet } from "~Screens/Flows/App/HomeScreen/Components/BottomSheets/RemoveAccountWarningBottomSheet"
import { useAccountDelete } from "~Screens/Flows/App/HomeScreen/Hooks/useAccountDelete"
import { useI18nContext } from "~i18n"

export const HomeScreen = () => {
    useTokenBalances()
    const { onSetSelectedAccount } = useSetSelectedAccount()

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

    const { setAccountToRemove, deleteAccount, isOnlyAccount } =
        useAccountDelete()

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
            <BaseSpacer height={10} />
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
        </BaseSafeArea>
    )
}
