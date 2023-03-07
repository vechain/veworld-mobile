import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    AddAccountBottomSheet,
    TokenList,
    NFTList,
    HeaderView,
    EditTokens,
    AccountManagementBottomSheet,
} from "./Components"
import { useBottomSheetModal } from "~Common"
import { useActiveWalletEntity } from "~Common/Hooks/Entities"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMemoizedAnimation } from "./Hooks/useMemoizedAnimation"
import { SafeAreaView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

export const HomeScreen = () => {
    const nav = useNavigation()
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

    const { coinListEnter, coinListExit, NFTListEnter, NFTListExit } =
        useMemoizedAnimation()

    const [activeTab, setActiveTab] = useState(0)

    const [isEdit, setIsEdit] = useState(false)

    const paddingBottom = useBottomTabBarHeight()

    const visibleHeightRef = useRef<number>(0)

    const activeCard = useActiveWalletEntity()

    const activeCardIndex = useMemo(
        () => activeCard.activeIndex,
        [activeCard.activeIndex],
    )

    useEffect(() => {
        console.log("activeCardIndex", activeCardIndex)
    }, [activeCardIndex])

    const navigateToCreateWallet = useCallback(() => {
        nav.navigate(Routes.CREATE_WALLET_FLOW)
    }, [nav])

    return (
        <>
            <SafeAreaView />
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <HeaderView
                    navigateToCreateWallet={navigateToCreateWallet}
                    openAccountManagementSheet={openAccountManagementSheet}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />

                <EditTokens isEdit={isEdit} action={setIsEdit} />

                {activeTab === 0 ? (
                    <TokenList
                        isEdit={isEdit}
                        visibleHeightRef={visibleHeightRef.current}
                        entering={coinListEnter}
                        exiting={coinListExit}
                    />
                ) : (
                    <NFTList entering={NFTListEnter} exiting={NFTListExit} />
                )}
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
        </>
    )
}

/*
useEffect(() => {
    const init = async () => {
        let accounts = devices[0].accounts
        if (accounts) {
            console.log(accounts)
            let parent = accounts[0].linkingObjects("Device", "accounts")
            if (parent) {
                console.log("parent", parent)
            }
        }
    }

    setTimeout(() => {
        init()
    }, 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
*/
