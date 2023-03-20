import React, { useCallback, useRef, useState } from "react"
import { FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseView,
    ListSlide,
    PaginationItem,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import {
    BuyInfoIconSVG,
    SustainableIconSVG,
    VeChainVetLogoWithTitleSVG,
    CustomizationIconSVG,
} from "~Assets"
import { Slide } from "~Model"
import { STEPS } from "./Enums"
import { useSharedValue } from "react-native-reanimated"

export const OnboardingScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const flatListRef = useRef<FlatList | null>(null)
    const [listIndex, setListIndex] = useState(1)
    const [btnIndex, setBtnIndex] = useState(0)

    // Progress value for the stage of onboarding
    const progressValue = useSharedValue<number>(0)

    const slides = [
        {
            title: LL.TITLE_ONBARDING_SLIDE_01(),
            text: LL.BD_ONBOARDING_SLIDE_01(),
            icon: <BuyInfoIconSVG />,
            button: LL.BTN_ONBOARDING_SLIDE_01(),
        },
        {
            title: LL.TITLE_ONBARDING_SLIDE_02(),
            text: LL.BD_ONBOARDING_SLIDE_02(),
            icon: <SustainableIconSVG />,
            button: LL.BTN_ONBOARDING_SLIDE_02(),
        },
        {
            title: LL.TITLE_ONBARDING_SLIDE_03(),
            text: LL.BD_ONBOARDING_SLIDE_03(),
            icon: <CustomizationIconSVG />,
            button: LL.BTN_ONBOARDING_SLIDE_03(),
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

            if (activeIndex < STEPS.SAFE_AND_FAST) {
                setListIndex(activeIndex + 1)
            }
        },
        [progressValue],
    )

    const onButtonPress = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: listIndex })
        }

        if (btnIndex === STEPS.SAFE_AND_FAST) {
            nav.navigate(Routes.WALLET_TYPE_CREATION)
        }
    }

    const onNavigate = () => {
        nav.navigate(Routes.WALLET_TYPE_CREATION)
    }

    return (
        <BaseSafeArea grow={1} testID="ONBOARDING_SCREEN">
            <BaseSpacer height={20} />
            <BaseView alignItems="center">
                <VeChainVetLogoWithTitleSVG />

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
                    <BaseView flexDirection="row" py={24}>
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
                        title={LL.BTN_ONBOARDING_SKIP()}
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
