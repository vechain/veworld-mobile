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
import { BaseSafeArea, BaseSpacer, SelectAccountBottomSheet } from "~Components"
import { FadeInRight } from "react-native-reanimated"
import { useTokenBalances } from "./Hooks/useTokenBalances"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { AccountWithDevice } from "~Model"

export const HomeScreen = () => {
    useTokenBalances()
    const { onSetSelectedAccount } = useSetSelectedAccount()

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
                    entering={animateEntering}
                />
            </NestableScrollContainer>

            <AccountManagementBottomSheet
                ref={accountManagementBottomSheetRef}
                onClose={closeAccountManagementSheet}
                openAddAccountSheet={openAddAccountSheet}
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
                ref={selectAccountBottomSheetRef}
            />
        </BaseSafeArea>
    )
}
