import React, { useCallback, useEffect, useMemo, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { BaseSpacer, BaseView } from "~Components"
import {
    ActiveWalletCard,
    Device,
    useCachedQuery,
    useStoreQuery,
} from "~Storage"
import {
    CoinList,
    NFTList,
    TabbarHeader,
    PlatformScrollView,
    DeviceCarousel,
    SafeAreaAndStatusBar,
    Header,
} from "./Components"
import {
    FadeInRight,
    SlideInLeft,
    SlideInRight,
    useSharedValue,
} from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

export const HomeScreen = () => {
    const nav = useNavigation()
    // const createAccountFor = useCreateAccount()

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
    const result2 = useCachedQuery(ActiveWalletCard)
    const activeCard = useMemo(() => result2.sorted("_id"), [result2])

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

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

    const onHeaderPress = () => {
        // createAccountFor(
        //     devices.filtered(`index == ${activeCard[0]?.activeIndex ?? 1}`),
        // )
        nav.navigate(Routes.CREATE_WALLET_FLOW)
    }

    return (
        <>
            <PlatformScrollView handleScrollPOsition={handleScrollPOsition}>
                <BaseView align="center">
                    <Header action={onHeaderPress} />
                    <BaseSpacer height={20} />
                    <DeviceCarousel devices={devices} />
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

// import * as i18n from "~i18n"
// import { Results } from "realm"

// const useCreateAccount = () => {
//     const store = useStore()

//     const createAccountFor = useCallback(
//         (device: Results<Device>) => {
//             const locale = i18n.detectLocale()
//             let alias = i18n.i18n()[locale].WALLET_LABEL_account()

//             if (!device[0].xPub) {
//                 return
//             }

//             let nextIndex = device[0].accounts?.length
//                 ? device[0].accounts?.length + 1
//                 : 1

//             console.log(nextIndex)
//             const address = AddressUtils.getAddressFromXPub(
//                 device[0].xPub,
//                 nextIndex,
//             )

//             let account: Account

//             store.write(() => {
//                 account = store.create(RealmClass.Account, {
//                     address: address,
//                     index: nextIndex,
//                     visible: true,
//                     id: nextIndex,
//                     alias: `${alias} ${nextIndex}`,
//                 })

//                 device[0].accounts?.push(account)
//             })
//         },
//         [store],
//     )

//     return createAccountFor
// }
