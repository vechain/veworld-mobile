import { FlatList } from "react-native"
import React, { useCallback, useRef, useState } from "react"
import { useI18nContext } from "~i18n"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    ListSlide,
    PaginationItem,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { Slide } from "~Model"
import { STEPS } from "../Enums"
import { ShieldIconSVG, KeyIconSVG, ChessIconSVG } from "~Assets"
import { useSharedValue } from "react-native-reanimated"

export const TutorialScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const flatListRef = useRef<FlatList | null>(null)
    const [listIndex, setListIndex] = useState(1)
    const [btnIndex, setBtnIndex] = useState(0)

    // Progress value for the stage of tutorial screen
    const progressValue = useSharedValue<number>(0)

    const slides = [
        {
            title: LL.TITLE_WALLET_TUTORIAL_SLIDE_01(),
            text: LL.BD_WALLET_TUTORIAL_SLIDE_01(),
            icon: <ShieldIconSVG />,
            button: LL.BTN_WALLET_TUTORIAL_SLIDE_01(),
        },
        {
            title: LL.TITLE_WALLET_TUTORIAL_SLIDE_02(),
            text: LL.BD_WALLET_TUTORIAL_SLIDE_02(),
            icon: <KeyIconSVG />,
            button: LL.BTN_WALLET_TUTORIAL_SLIDE_02(),
        },
        {
            title: LL.TITLE_WALLET_TUTORIAL_SLIDE_03(),
            text: LL.BD_WALLET_TUTORIAL_SLIDE_03(),
            icon: <ChessIconSVG />,
            button: LL.BTN_WALLET_TUTORIAL_SLIDE_03(),
        },
    ]

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: any) => {
            let activeIndex = viewableItems[0].index
            setBtnIndex(activeIndex)

            //Quickly switch PaginatedItem to the next or previous slide when visible on screen
            if (
                viewableItems[1] &&
                viewableItems[1].index !== progressValue.value
            )
                progressValue.value = viewableItems[1].index
            else progressValue.value = viewableItems[0].index

            if (activeIndex < STEPS.SAFETY) {
                setListIndex(activeIndex + 1)
            }
        },
        [progressValue],
    )

    const onButtonPress = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: listIndex })
        }

        if (btnIndex === STEPS.SAFETY) {
            nav.navigate(Routes.NEW_MNEMONIC)
        }
    }

    const onNavigate = () => {
        nav.navigate(Routes.NEW_MNEMONIC)
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView alignItems="center">
                <BaseView alignSelf="flex-start" mx={20}>
                    <BaseText typographyFont="largeTitle">
                        {LL.TITLE_CREATE_WALLET_TYPE()}
                    </BaseText>
                </BaseView>

                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={({ item }: { item: Slide }) => (
                        <ListSlide item={item} />
                    )}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    horizontal
                    pagingEnabled={true}
                    snapToAlignment="start"
                    onViewableItemsChanged={onViewableItemsChanged}
                    keyExtractor={item => item.title}
                />
            </BaseView>
            <BaseView
                alignItems="center"
                flexGrow={1}
                justifyContent="space-between">
                {!!progressValue && (
                    <BaseView flexDirection="row" alignSelf="center" py={24}>
                        {slides.map((slide, index) => (
                            <PaginationItem
                                animValue={progressValue}
                                index={index}
                                key={slide.title}
                                length={slides.length}
                            />
                        ))}
                    </BaseView>
                )}

                <BaseView alignItems="center" w={100} px={20}>
                    <BaseButton
                        action={onNavigate}
                        typographyFont="bodyMedium"
                        title={LL.BTN_WALLET_TUTORIAL_SKIP()}
                        px={5}
                        variant="link"
                    />

                    <BaseButton
                        action={onButtonPress}
                        w={100}
                        mx={20}
                        title={slides[btnIndex].button}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
