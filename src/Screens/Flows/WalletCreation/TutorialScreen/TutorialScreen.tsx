import { FlatList } from "react-native"
import React, { useCallback, useRef, useState } from "react"
import { useI18nContext } from "~i18n"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { ListSlide } from "../Components/ListSlide"
import { Slide } from "../Types"
import { STEPS } from "../Enums"
import { ShieldIconSVG, KeyIconSVG, ChessIconSVG } from "~Assets"

export const TutorialScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const flatListRef = useRef<FlatList | null>(null)
    const [ListIndex, setListIndex] = useState(1)
    const [BtnIndex, setBtnIndex] = useState(0)

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

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        let activeIndex = viewableItems[0].index
        setBtnIndex(activeIndex)

        if (activeIndex < STEPS.SAFETY) {
            setListIndex(activeIndex + 1)
        }
    }, [])

    const onButtonPress = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: ListIndex })
        }

        if (BtnIndex === STEPS.SAFETY) {
            nav.navigate(Routes.SEED_PHRASE)
        }
    }

    const onNavigate = () => {
        nav.navigate(Routes.SEED_PHRASE)
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" grow={1}>
                <BaseView selfAlign="flex-start" mx={20}>
                    <BaseText typographyFont="largeTitle">
                        Create Wallet
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

                <BaseView align="center" w={100} px={20}>
                    <BaseButton
                        action={onNavigate}
                        typographyFont="footNoteAccent"
                        title={LL.BTN_WALLET_TUTORIAL_SKIP()}
                        selfAlign="flex-start"
                        px={5}
                        variant="ghost"
                    />

                    <BaseButton
                        action={onButtonPress}
                        w={100}
                        mx={20}
                        title={slides[BtnIndex].button}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
