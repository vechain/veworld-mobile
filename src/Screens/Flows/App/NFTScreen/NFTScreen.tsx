import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import React, { useRef } from "react"
import { StyleSheet } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { SlideInLeft } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import { useMemoizedAnimation, useTheme } from "~Common"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { CollectionsList } from "./components"

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

    const theme = useTheme()
    return (
        <>
            <SafeAreaView />
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <BaseView flexDirection="row" mx={20}>
                    <BaseText typographyFont="largeTitle">
                        {LL.TITLE_NFTS()}
                    </BaseText>
                    <BaseView flexDirection="row">
                        <BaseIcon
                            color={theme.colors.text}
                            name="tray-arrow-up"
                            size={24}
                        />

                        <BaseIcon
                            // color={theme.colors.text}
                            action={() => {}}
                            style={baseStyles.sendIcon}
                            bg={theme.colors.primary}
                            name="send-outline"
                            size={24}
                        />

                        <BaseIcon
                            // color={theme.colors.text}
                            action={() => {}}
                            style={baseStyles.receiveIcon}
                            bg={theme.colors.primary}
                            name="arrow-down"
                            size={24}
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={24} />
                <CollectionsList
                    entering={animateEntering}
                    exiting={animateExiting}
                />
            </NestableScrollContainer>
        </>
    )
}

const baseStyles = StyleSheet.create({
    sendIcon: {
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        marginLeft: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    receiveIcon: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        marginLeft: 2,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
})
