// /* eslint-disable react-native/no-inline-styles */
// import React, { memo, useEffect, useMemo, useRef, useState } from "react"
// import { NestableScrollContainer } from "react-native-draggable-flatlist"
// import { BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
// import {
//     AccountsCarousel,
//     Header,
//     NFTList,
//     TabbarHeader,
//     TokenList,
// } from "./Components"
// import { Device, useListListener, useRealm } from "~Storage"
// import HomeScreenBottomSheet from "./Components/HomeScreenBottomSheet"
// import { useBottomSheetModal } from "~Common"
// import { useActiveWalletEntity } from "~Common/Hooks/Entities"
// import { useMeoizedAnimation } from "./Hooks/useMeoizedAnimation"
// import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

// if (__DEV__) {
//     const ignoreWarns = [
//         "VirtualizedLists should never be nested inside plain ScrollViews",
//     ]

//     const errorWarn = global.console.error
//     global.console.error = (...arg) => {
//         for (const error of ignoreWarns) {
//             if (arg[0].startsWith(error)) {
//                 return
//             }
//         }
//         errorWarn(...arg)
//     }
// }

// export function DraggableTest() {
//     const [activeScreen, setActiveScreen] = useState(0)
//     const [isEdit, setIsEdit] = useState(false)

//     const { store } = useRealm()
//     const devices = useListListener(Device.getName(), store) as Device[]
//     const activeCard = useActiveWalletEntity()

//     const {
//         ref: bottomSheetRef,
//         onOpen: openBottomSheetMenu,
//         onClose: closeBottomSheetMenu,
//     } = useBottomSheetModal()

//     const activeDevice = useMemo(() => devices[0], [devices])

//     const activeCardIndex = useMemo(
//         () => activeCard.activeIndex,
//         [activeCard.activeIndex],
//     )

//     useEffect(() => {
//         console.log("activeCardIndex", activeCardIndex)
//     }, [activeCardIndex])

//     const { coinListEnter, coinListExit, NFTListEnter, NFTListExit } =
//         useMeoizedAnimation()

//     const paddingBottom = useBottomTabBarHeight()

//     const visibleHeightRef = useRef<number>(0)

//     return (
//         <>
//             <NestableScrollContainer
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={{ paddingBottom, paddingTop: 60 }}
//                 onContentSizeChange={visibleHeight => {
//                     visibleHeightRef.current = visibleHeight
//                 }}>
//                 <HeaaderView
//                     activeDevice={activeDevice}
//                     openBottomSheetMenu={openBottomSheetMenu}
//                     setActiveScreen={setActiveScreen}
//                 />

//                 <BaseView
//                     orientation="row"
//                     justify="space-evenly"
//                     align="center"
//                     px={20}
//                     py={30}>
//                     <BaseText>Buy</BaseText>
//                     <BaseText>Send</BaseText>
//                     <BaseText>Swap</BaseText>
//                     <BaseText>History</BaseText>
//                 </BaseView>

//                 <BaseView
//                     orientation="row"
//                     justify="space-between"
//                     align="center"
//                     px={20}
//                     my={20}>
//                     <BaseText typographyFont="subTitle">Your Tokens</BaseText>
//                     <BaseButton
//                         bgColor={isEdit ? "red" : "green"}
//                         title="Edit"
//                         action={() => setIsEdit(prevState => !prevState)}
//                     />
//                 </BaseView>

//                 {activeScreen === 0 ? (
//                     <TokenList
//                         isEdit={isEdit}
//                         visibleHeightRef={visibleHeightRef.current}
//                         entering={coinListEnter}
//                         exiting={coinListExit}
//                     />
//                 ) : (
//                     <NFTList entering={NFTListEnter} exiting={NFTListExit} />
//                 )}
//             </NestableScrollContainer>

//             <HomeScreenBottomSheet
//                 ref={bottomSheetRef}
//                 onClose={closeBottomSheetMenu}
//                 activeDevice={activeDevice}
//             />
//         </>
//     )
// }

// type Props = {
//     activeDevice: Device
//     openBottomSheetMenu: () => void
//     setActiveScreen: (activeScreen: number) => void
// }

// const HeaaderView = memo(
//     ({ activeDevice, openBottomSheetMenu, setActiveScreen }: Props) => {
//         return (
//             <>
//                 <BaseView align="center">
//                     <Header action={openBottomSheetMenu} />
//                     <BaseSpacer height={20} />
//                     <AccountsCarousel accounts={activeDevice.accounts} />
//                 </BaseView>

//                 <BaseSpacer height={10} />
//                 <TabbarHeader action={setActiveScreen} />
//                 <BaseSpacer height={20} />
//             </>
//         )
//     },
// )
