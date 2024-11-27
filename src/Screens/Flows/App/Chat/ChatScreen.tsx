import React, { useCallback, useMemo } from "react"
import { Layout, SelectAccountBottomSheet } from "~Components"
import Header from "./Components/Header"
import { selectRegisteredClients, selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import ChatOnboarding from "./Components/ChatOnboarding"
import ChatConversations from "./Components/ChatConversations"
import { NewConversationBottomSheet } from "./Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

export const ChatScreen: React.FC = () => {
    const accounts = useAppSelector(selectVisibleAccounts)
    const currentAccount = useAppSelector(selectSelectedAccount)
    const registeredClients = useAppSelector(selectRegisteredClients)

    const nav = useNavigation()

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

    const {
        ref: newConversationBottomSheetRef,
        onOpen: openNewConversationBottomSheet,
        onClose: closeNewConversationBottonSheet,
    } = useBottomSheetModal()

    const onSelectAccount = useCallback(
        (recipient: string, topic: string) => {
            closeNewConversationBottonSheet()

            nav.navigate(Routes.CHAT_CONVERSATION, { recipient, topic })
        },
        [closeNewConversationBottonSheet, nav],
    )

    return (
        <Layout
            noMargin
            noBackButton
            fixedHeader={
                <Header
                    isOnboarding={isOnboarding}
                    onChangeAccountPress={openSelectAccountBottomSheet}
                    onNewConversation={openNewConversationBottomSheet}
                />
            }
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

                    <NewConversationBottomSheet
                        ref={newConversationBottomSheetRef}
                        onClose={closeNewConversationBottonSheet}
                        onConfirm={onSelectAccount}
                    />
                </>
            }
        />
    )
}
