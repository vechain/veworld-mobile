import React, {useCallback, useRef, useState} from 'react'
import {FlatList} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import VectorImage from 'react-native-vector-image'
import {BaseButton, BaseSafeArea, BaseSpacer, BaseView} from '~Components'
import {useI18nContext} from '~i18n'
import {Routes} from '~Navigation'
import {
    BuyInfoIcon,
    CustomizationIcon,
    SustainableIcon,
    VeChainVetLogoWithTitle,
} from '~Assets'
import {ListSlide} from './Components/ListSlide'
import {Slide} from './Types'
import {STEPS} from './Enums'

export const OnboardingScreen = () => {
    const nav = useNavigation()
    const {LL} = useI18nContext()

    const flatListRef = useRef<FlatList | null>(null)
    const [ListIndex, setListIndex] = useState(1)
    const [BtnIndex, setBtnIndex] = useState(0)

    const slides = [
        {
            title: LL.TITLE_ONBARDING_SLIDE_01(),
            text: LL.BD_ONBOARDING_SLIDE_01(),
            icon: BuyInfoIcon,
            button: LL.BTN_ONBOARDING_SLIDE_01(),
        },
        {
            title: LL.TITLE_ONBARDING_SLIDE_02(),
            text: LL.BD_ONBOARDING_SLIDE_02(),
            icon: SustainableIcon,
            button: LL.BTN_ONBOARDING_SLIDE_02(),
        },
        {
            title: LL.TITLE_ONBARDING_SLIDE_03(),
            text: LL.BD_ONBOARDING_SLIDE_03(),
            icon: CustomizationIcon,
            button: LL.BTN_ONBOARDING_SLIDE_03(),
        },
    ]

    const onViewableItemsChanged = useCallback(({viewableItems}: any) => {
        let activeIndex = viewableItems[0].index
        setBtnIndex(activeIndex)

        if (activeIndex < STEPS.SAFE_AND_FAST) {
            setListIndex(activeIndex + 1)
        }
    }, [])

    const onButtonPress = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({index: ListIndex})
        }

        if (BtnIndex === STEPS.SAFE_AND_FAST) {
            nav.navigate(Routes.WALLET_TPYE_CREATION)
        }
    }

    const onNavigate = () => {
        nav.navigate(Routes.WALLET_TPYE_CREATION)
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" grow={1}>
                <VectorImage source={VeChainVetLogoWithTitle} />

                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={({item}: {item: Slide}) => (
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
                        font="footnote_accent"
                        title={LL.BTN_ONBOARDING_SKIP()}
                        selfAlign="flex-start"
                        px={5}
                    />

                    <BaseButton
                        filled
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
