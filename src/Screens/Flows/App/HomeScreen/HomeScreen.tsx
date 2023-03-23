import React, { useRef, useState, useEffect } from "react"
import {
    AddAccountBottomSheet,
    TokenList,
    HeaderView,
    EditTokensBar,
    AccountManagementBottomSheet,
} from "./Components"
import { useBottomSheetModal, useMemoizedAnimation } from "~Common"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useIsFocused } from "@react-navigation/native"
import { BaseSpacer, BaseSafeArea, useThor } from "~Components"
import { SlideInLeft } from "react-native-reanimated"

export const HomeScreen = () => {
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

    const { animateEntering, animateExiting } = useMemoizedAnimation({
        enteringAnimation: new SlideInLeft(),
        enteringDelay: 200,
        enteringDuration: 200,
        exitingAnimation: new SlideInLeft(),
        exitingDelay: 0,
        exitingDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)

    const paddingBottom = useBottomTabBarHeight()

    const visibleHeightRef = useRef<number>(0)

    const isFocused = useIsFocused()
    const thor = useThor()

    useEffect(() => {
        async function init() {
            const genesis = thor.genesis.id
            console.log("genesis number", genesis)
        }
        init()
    }, [isFocused, thor])

    return (
        <BaseSafeArea grow={1}>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <HeaderView
                    openAccountManagementSheet={openAccountManagementSheet}
                />
                <BaseSpacer height={24} />
                <EditTokensBar isEdit={isEdit} setIsEdit={setIsEdit} />
                <BaseSpacer height={24} />
                <TokenList
                    isEdit={isEdit}
                    visibleHeightRef={visibleHeightRef.current}
                    entering={animateEntering}
                    exiting={animateExiting}
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
        </BaseSafeArea>
    )
}
