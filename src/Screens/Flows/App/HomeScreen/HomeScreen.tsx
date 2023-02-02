import React, { useEffect, useMemo, useState } from "react"
import { DeviceCarousel } from "./Components/DeviceCarousel"
import { BaseScrollView, BaseSpacer, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"
import {
    ActiveWalletCard,
    useCachedQuery,
    Device,
    useStoreQuery,
} from "~Storage"
import { TabbarHeader } from "./Components/TabbarHeader"
import { CoinList, NFTList } from "./Components"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { Dimensions } from "react-native"

const WINDOW = Dimensions.get("window").width

export const HomeScreen = () => {
    const [activeScreen, setActiveScreen] = useState("Token")
    const progressValue = useSharedValue<number>(0)

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    // todo: this is a workaround until the new version is installed
    const result2 = useCachedQuery(ActiveWalletCard)
    const activeCard = useMemo(() => result2.sorted("_id"), [result2])

    console.log(devices)
    console.log(activeCard)

    useEffect(() => {
        if (activeScreen === "Token") {
            progressValue.value = 0
        } else {
            progressValue.value = 1
        }
    }, [activeScreen, progressValue])

    const animatedWidthToken = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(
                        progressValue.value === 0 ? 0 : -WINDOW,
                    ),
                },
            ],
        }
    }, [])

    const animatedWidthNft = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(
                        progressValue.value === 0 ? +WINDOW : 0,
                    ),
                },
            ],
        }
    }, [])

    return (
        <BaseScrollView>
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

            <BaseView orientation="row">
                <Animated.View style={animatedWidthToken}>
                    <CoinList />
                </Animated.View>
                <Animated.View style={animatedWidthNft}>
                    <NFTList />
                </Animated.View>
            </BaseView>
        </BaseScrollView>
    )
}
