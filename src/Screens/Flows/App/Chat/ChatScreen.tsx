import React, { useMemo } from "react"
import { Layout, SelectAccountBottomSheet } from "~Components"
import Header from "./Components/Header"
import { selectRegisteredClients, selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import ChatOnboarding from "./Components/ChatOnboarding"
import ChatConversations from "./Components/ChatConversations"

export const ChatScreen: React.FC = () => {
    const accounts = useAppSelector(selectVisibleAccounts)
    const currentAccount = useAppSelector(selectSelectedAccount)
    const registeredClients = useAppSelector(selectRegisteredClients)

    const isOnboarding = useMemo(
        () => !registeredClients.includes(currentAccount.address),
        [currentAccount.address, registeredClients],
    )

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
            fixedHeader={<Header isOnboarding={isOnboarding} onChangeAccountPress={openSelectAccountBottomSheet} />}
            fixedBody={
                <>
                    {isOnboarding ? <ChatOnboarding /> : <ChatConversations />}

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
