import React, { useEffect, useMemo, useRef, useState } from "react"
import { BaseButton, BaseSafeArea, BaseText, BaseView } from "~Components"
import { Device, useRealm, useListListener } from "~Storage"
import {
    TokenList,
    NFTList,
    HeaaderView,
    HomeScreenBottomSheet,
} from "./Components"
import { useBottomSheetModal } from "~Common"
import { useMeoizedAnimation } from "./Hooks/useMeoizedAnimation"
import { useActiveWalletEntity } from "~Common/Hooks/Entities"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

//todo: get currently active wallet
const ACTIVE_WALLET = 0

export const HomeScreen = () => {
    const { store } = useRealm()
    const {
        ref: bottomSheetRef,
        onOpen: openBottomSheetMenu,
        onClose: closeBottomSheetMenu,
    } = useBottomSheetModal()

    const { coinListEnter, coinListExit, NFTListEnter, NFTListExit } =
        useMeoizedAnimation()

    const [activeScreen, setActiveScreen] = useState(0)

    const [isEdit, setIsEdit] = useState(false)

    const paddingBottom = useBottomTabBarHeight()

    const visibleHeightRef = useRef<number>(0)

    const activeCard = useActiveWalletEntity()

    const activeCardIndex = useMemo(
        () => activeCard.activeIndex,
        [activeCard.activeIndex],
    )

    const devices = useListListener(Device.getName(), store) as Device[]

    useEffect(() => {
        console.log("activeCardIndex", activeCardIndex)
    }, [activeCardIndex])

    const activeDevice = useMemo(() => devices[ACTIVE_WALLET], [devices])

    return (
        <>
            <BaseSafeArea />
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <HeaaderView
                    activeDevice={activeDevice}
                    openBottomSheetMenu={openBottomSheetMenu}
                    setActiveScreen={setActiveScreen}
                />

                <BaseView
                    orientation="row"
                    justify="space-evenly"
                    align="center"
                    px={20}
                    py={30}>
                    <BaseText>Buy</BaseText>
                    <BaseText>Send</BaseText>
                    <BaseText>Swap</BaseText>
                    <BaseText>History</BaseText>
                </BaseView>

                <BaseView
                    orientation="row"
                    justify="space-between"
                    align="center"
                    px={20}
                    my={20}>
                    <BaseText typographyFont="subTitle">Your Tokens</BaseText>
                    <BaseButton
                        bgColor={isEdit ? "red" : "green"}
                        title="Edit"
                        action={() => setIsEdit(prevState => !prevState)}
                    />
                </BaseView>

                {activeScreen === 0 ? (
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

            <HomeScreenBottomSheet
                ref={bottomSheetRef}
                onClose={closeBottomSheetMenu}
                activeDevice={activeDevice}
            />
        </>
    )
}

/*
!Sample get inverse relationship
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
