import React, { useCallback, useEffect, useMemo, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { BaseSpacer, BaseView } from "~Components"
import { Device, useRealm, useListListener } from "~Storage"
import {
    CoinList,
    NFTList,
    TabbarHeader,
    PlatformScrollView,
    SafeAreaAndStatusBar,
    Header,
    AccountsCarousel,
} from "./Components"
import { useSharedValue } from "react-native-reanimated"
import { useBottomSheetModal } from "~Common"
import { useMeoizedAnimation } from "./Hooks/useMeoizedAnimation"
import HomeScreenBottomSheet from "./Components/HomeScreenBottomSheet"
import { useActiveWalletEntity } from "~Common/Hooks/Entities"

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

//todo: get currently active wallet
const ACTIVE_WALLET = 0

export const HomeScreen = () => {
    const { store } = useRealm()
    const { activeWalletEntity } = useActiveWalletEntity()
    const {
        ref: bottomSheetRef,
        onOpen: openBottomSheetMenu,
        onClose: closeBottomSheetMenu,
    } = useBottomSheetModal()

    const { coinListEnter, coinListExit, NFTListEnter, NFTListExit } =
        useMeoizedAnimation()

    const [activeScreen, setActiveScreen] = useState(0)
    const [changeContent, setChangeContent] = useState(false)
    const scrollValue = useSharedValue<number>(-59)

    const handleScrollPosition = useCallback(
        (event: ScrollEvent) => {
            //TODO: iphone 14 pro -59 / iphone 11 -48
            // inconsistemcy in values creates probelms to animation
            // console.log(event.nativeEvent.contentOffset.y)

            scrollValue.value = event.nativeEvent.contentOffset.y
            event.nativeEvent.contentOffset.y > -20
                ? setChangeContent(true)
                : setChangeContent(false)
        },
        [scrollValue],
    )

    const activeCardIndex = useMemo(
        () => activeWalletEntity.activeIndex,
        [activeWalletEntity.activeIndex],
    )

    const devices = useListListener(Device.getName(), store) as Device[]

    useEffect(() => {
        console.log("activeCardIndex", activeCardIndex)
    }, [activeCardIndex])

    const activeDevice = useMemo(() => devices[ACTIVE_WALLET], [devices])

    const getActiveScreen = useCallback(() => {
        if (activeScreen === 0)
            return <CoinList entering={coinListEnter} exiting={coinListExit} />

        return <NFTList entering={NFTListEnter} exiting={NFTListExit} />
    }, [activeScreen, coinListEnter, coinListExit, NFTListEnter, NFTListExit])

    return (
        <BaseView>
            <PlatformScrollView handleScrollPosition={handleScrollPosition}>
                <BaseView align="center">
                    <Header action={openBottomSheetMenu} />
                    <BaseSpacer height={20} />
                    <AccountsCarousel
                        accounts={devices[ACTIVE_WALLET].accounts}
                    />
                </BaseView>

                <BaseSpacer height={10} />
                <TabbarHeader action={setActiveScreen} />
                <BaseSpacer height={20} />

                <BaseView orientation="row" grow={1}>
                    {getActiveScreen()}
                </BaseView>
            </PlatformScrollView>

            {/* this is placed at the bottom of the component in order to be on top of everything in the view stack */}
            <SafeAreaAndStatusBar
                statusBarContent={changeContent}
                scrollValue={scrollValue}
            />
            <HomeScreenBottomSheet
                ref={bottomSheetRef}
                onClose={closeBottomSheetMenu}
                activeDevice={activeDevice}
            />
        </BaseView>
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

!Sample decryption with biometrics
useEffect(() => {
    const init = async () => {
        let wallet = devices[0].wallet
        if (wallet) {
            let encryptedKey = await KeychainService.getEncryptionKey(
                devices[0].index,
                true,
            )
            if (encryptedKey) {
                let _wallet = CryptoUtils.decrypt<Wallet>(wallet, encryptedKey)
                console.log(_wallet)
            }
        }
    }

    setTimeout(() => {
        init()
    }, 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

!Sample decryption with password
useEffect(() => {
    const init = async () => {
        let wallet = devices[0].wallet
        if (wallet) {
            let encryptedKey = await KeychainService.getEncryptionKey(
                devices[0].index,
            )
            if (encryptedKey) {
                const hashedKey = PasswordUtils.hash("000000") // user input password
                let decryptedKey = CryptoUtils.decrypt<string>(
                    encryptedKey,
                    hashedKey,
                )
                let _wallet = CryptoUtils.decrypt<Wallet>(wallet, decryptedKey)
                console.log("_wallet : ", _wallet)
            }
        }
    }
    setTimeout(() => {
        init()
    }, 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
*/
