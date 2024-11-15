import React from "react"
import { Layout, SelectAccountBottomSheet } from "~Components"
import Header from "./Components/Header"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { useBottomSheetModal, useSetSelectedAccount } from "~Hooks"

export const ChatScreen: React.FC = () => {
    const accounts = useAppSelector(selectVisibleAccounts)
    const currentAccount = useAppSelector(selectSelectedAccount)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    return (
        <Layout
            noMargin
            noBackButton
            fixedHeader={<Header onChangeAccountPress={openSelectAccountBottomSheet} />}
            fixedBody={
                <>
                    <NestableScrollContainer />

                    <SelectAccountBottomSheet
                        accounts={accounts}
                        ref={selectAccountBottomSheetRef}
                        setSelectedAccount={onSetSelectedAccount}
                        selectedAccount={currentAccount}
                        closeBottomSheet={closeSelectAccountBottonSheet}
                    />
                </>
            }
        />
    )
}
