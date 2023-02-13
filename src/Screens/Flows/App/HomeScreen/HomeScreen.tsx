import React, { useCallback, useEffect, useMemo, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"
import {
    ActiveWalletCard,
    useCachedQuery,
    Device,
    useStoreQuery,
} from "~Storage"
import {
    CoinList,
    NFTList,
    TabbarHeader,
    PlatformScrollView,
    DeviceCarousel,
    SafeAreaAndStatusBar,
} from "./Components"
import {
    FadeInRight,
    SlideInLeft,
    SlideInRight,
    useSharedValue,
} from "react-native-reanimated"

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

export const HomeScreen = () => {
    const [activeScreen, setActiveScreen] = useState(0)
    const [firstLoad, setFirstLoad] = useState(true)
    const [changeContent, setChangeContent] = useState(false)
    const scrollValue = useSharedValue<number>(-59)

    const handleScrollPOsition = useCallback(
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

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    // todo: this is a workaround until the new version is installed
    const result2 = useCachedQuery(ActiveWalletCard)
    const activeCard = useMemo(() => result2.sorted("_id"), [result2])

    console.log(devices)
    console.log(activeCard)

    useEffect(() => {
        setFirstLoad(false)
    }, [])

    // Sample decryption with biometrics
    useEffect(() => {
        const init = async () => {
            // let wallet = devices[0].wallet
            // if (wallet) {
            //     let encryptedKey = await KeychainService.getEncryptionKey(
            //         devices[0].index,
            //         true,
            //     )
            //     if (encryptedKey) {
            //         let _wallet = CryptoUtils.decrypt<Wallet>(
            //             wallet,
            //             encryptedKey,
            //         )
            //         console.log(_wallet)
            //     }
            // }
        }

        setTimeout(() => {
            init()
        }, 5000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sample decryption with password
    useEffect(() => {
        const init = async () => {
            // let wallet = devices[0].wallet
            // if (wallet) {
            //     let encryptedKey = await KeychainService.getEncryptionKey(
            //         devices[0].index,
            //     )
            //     if (encryptedKey) {
            //         const hashedKey = PasswordUtils.hash("000000") // user input password
            //         let decryptedKey = CryptoUtils.decrypt<string>(
            //             encryptedKey,
            //             hashedKey,
            //         )
            //         let _wallet = CryptoUtils.decrypt<Wallet>(
            //             wallet,
            //             decryptedKey,
            //         )
            //         console.log("_wallet : ", _wallet)
            //     }
            // }
        }
        setTimeout(() => {
            init()
        }, 5000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <PlatformScrollView handleScrollPOsition={handleScrollPOsition}>
                <BaseView align="center">
                    <BaseView align="flex-start" selfAlign="flex-start" mx={20}>
                        <BaseText font={Fonts.body}>Welcome to</BaseText>
                        <BaseText font={Fonts.large_title}>VeWorld</BaseText>
                    </BaseView>

                    <BaseSpacer height={20} />
                    <DeviceCarousel />
                </BaseView>

                <BaseSpacer height={10} />
                <TabbarHeader action={setActiveScreen} />
                <BaseSpacer height={20} />

                <BaseView orientation="row" grow={1}>
                    {activeScreen === 0 ? (
                        <CoinList
                            entering={
                                firstLoad
                                    ? FadeInRight.delay(220).duration(250)
                                    : SlideInLeft.delay(50).duration(200)
                            }
                            exiting={SlideInRight.delay(50).duration(200)}
                        />
                    ) : (
                        <NFTList
                            entering={SlideInRight.delay(50).duration(200)}
                            exiting={SlideInLeft.delay(50).duration(200)}
                        />
                    )}
                </BaseView>
            </PlatformScrollView>

            {/* this is placed at the bottom of the component in order to be on top of everything in the view stack */}
            <SafeAreaAndStatusBar
                statusBarContent={changeContent}
                scrollValue={scrollValue}
            />
        </>
    )
}
