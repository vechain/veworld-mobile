import React, { useRef, useState } from "react"
import {
    AddAccountBottomSheet,
    TokenList,
    HeaderView,
    AccountManagementBottomSheet,
    EditTokensBar,
} from "./Components"
import {
    useBottomSheetModal,
    useMemoizedAnimation,
    useSetSelectedAccount,
} from "~Hooks"
import {
    BaseSafeArea,
    BaseSpacer,
    QRCodeBottomSheet,
    RenameWalletBottomSheet,
    SelectAccountBottomSheet,
} from "~Components"
import { FadeInRight } from "react-native-reanimated"
import { useTokenBalances } from "./Hooks/useTokenBalances"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    selectBalanceVisible,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { AccountWithDevice, RENAME_WALLET_TYPE } from "~Model"

export const HomeScreen = () => {
    useTokenBalances()
    const { onSetSelectedAccount } = useSetSelectedAccount()

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
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } =
        useBottomSheetModal()

    const {
        ref: renameAccountBottomSheetRef,
        onOpen: openRenameAccountBottomSheet,
        onClose: closeRenameAccountBottonSheet,
    } = useBottomSheetModal()

    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { animateEntering } = useMemoizedAnimation({
        enteringAnimation: new FadeInRight(),
        enteringDelay: 50,
        enteringDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const visibleHeightRef = useRef<number>(0)

    return (
        <BaseSafeArea grow={1}>
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
            </NestableScrollContainer>

            <AccountManagementBottomSheet
                ref={accountManagementBottomSheetRef}
                onClose={closeAccountManagementSheet}
                openAddAccountSheet={openAddAccountSheet}
                openQRCodeSheet={openQRCodeSheet}
                openRenameAccountBottomSheet={openRenameAccountBottomSheet}
            />

            <AddAccountBottomSheet
                ref={addAccountBottomSheetRef}
                onClose={closeAddAccountSheet}
            />

            <SelectAccountBottomSheet
                closeBottomSheet={closeSelectAccountBottonSheet}
                accounts={accounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                isBalanceVisible={isBalanceVisible}
                ref={selectAccountBottomSheetRef}
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
