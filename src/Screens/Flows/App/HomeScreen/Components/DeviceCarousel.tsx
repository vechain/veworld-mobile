import React from "react"
import Carousel from "react-native-reanimated-carousel"
import { FadeInRight } from "react-native-reanimated"
import {
    StyleProp,
    ViewStyle,
    ViewProps,
    View,
    Text,
    StyleSheet,
    Dimensions,
} from "react-native"
import { LongPressGestureHandler } from "react-native-gesture-handler"
import type { AnimateProps } from "react-native-reanimated"
import Animated, { useSharedValue } from "react-native-reanimated"
import Constants from "expo-constants"
import { PaginationItem } from "./PaginationItem"

const viewCount = 5
const width = Dimensions.get("window").width - 40
const StackConfig = {
    showLength: 3,
    stackInterval: 18,
    rotateZDeg: 0,
    scaleInterval: 0.05,
    opacityInterval: 0.5,
}

let devices = [...new Array(6).keys()]

export const DeviceCarousel = () => {
    const progressValue = useSharedValue<number>(0)

    return (
        <>
            <Carousel
                loop={false}
                style={baseStyles.carouselContainer}
                width={width}
                height={180}
                pagingEnabled={true}
                snapEnabled={true}
                scrollAnimationDuration={1000}
                mode={"horizontal-stack"}
                data={devices}
                modeConfig={StackConfig}
                onProgressChange={(_, absoluteProgress) =>
                    (progressValue.value = absoluteProgress)
                }
                customConfig={() => ({ type: "positive", viewCount })}
                renderItem={({ index }) => (
                    <SBItem
                        index={index}
                        key={index}
                        entering={FadeInRight.delay(
                            (viewCount - index) * 100,
                        ).duration(200)}
                    />
                )}
            />

            {!!progressValue && (
                <View style={baseStyles.dotContainer}>
                    {devices.map((device, index) => {
                        return (
                            <PaginationItem
                                animValue={progressValue}
                                index={index}
                                key={index}
                                length={devices.length}
                            />
                        )
                    })}
                </View>
            )}
        </>
    )
}

const baseStyles = StyleSheet.create({
    carouselContainer: {
        width: "100%",
        height: 190,
        alignItems: "center",
        justifyContent: "center",
    },
    dotContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
        paddingTop: 10,
    },
    itemContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#28008C",
        borderRadius: 22,
    },
})

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    index: number
    pretty?: boolean
}

export const SBItem: React.FC<Props> = props => {
    const { style, index, pretty, ...animatedViewProps } = props
    const enablePretty = Constants?.manifest?.extra?.enablePretty || false
    const [, setIsPretty] = React.useState(pretty || enablePretty)
    return (
        <LongPressGestureHandler
            onActivated={() => {
                setIsPretty(true)
            }}>
            <Animated.View style={{ flex: 1 }} {...animatedViewProps}>
                <View style={[baseStyles.itemContainer, style]}>
                    <Text style={{ fontSize: 30, color: "white" }}>
                        {index}
                    </Text>
                </View>
            </Animated.View>
        </LongPressGestureHandler>
    )
}
