import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import React, { useRef } from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { SlideInLeft } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import { useMemoizedAnimation } from "~Common"
import { BaseSpacer, BaseText } from "~Components"
import { useI18nContext } from "~i18n"
import { CollectionsList, FavouriteNfts, ImportNftBar } from "./components"

export type NFTItem = {
    key: string
    label: string
    height: number
    width: number
    backgroundColor: string
}

export const NFTScreen = () => {
    const { LL } = useI18nContext()
    const { animateEntering, animateExiting } = useMemoizedAnimation({
        enteringAnimation: new SlideInLeft(),
        enteringDelay: 200,
        enteringDuration: 200,
        exitingAnimation: new SlideInLeft(),
        exitingDelay: 0,
        exitingDuration: 200,
    })

    const paddingBottom = useBottomTabBarHeight()

    const visibleHeightRef = useRef<number>(0)

    return (
        <>
            <SafeAreaView />
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <BaseText typographyFont="largeTitle" mx={20}>
                    {LL.TITLE_NFTS()}
                </BaseText>

                <BaseSpacer height={24} />
                <FavouriteNfts />
                <ImportNftBar />
                <CollectionsList
                    entering={animateEntering}
                    exiting={animateExiting}
                />
            </NestableScrollContainer>
        </>
    )
}
