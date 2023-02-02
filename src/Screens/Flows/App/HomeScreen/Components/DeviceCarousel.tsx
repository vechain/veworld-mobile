import React, { useCallback } from "react"
import Carousel from "react-native-reanimated-carousel"
import { FadeIn, FadeInRight } from "react-native-reanimated"
import { StyleSheet, Dimensions } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import { PaginationItem } from "./PaginationItem"
import { Card } from "./Card"
import { BaseSpacer, BaseView } from "~Components"
import { useActiveCard } from "../Hooks/useActiveCard"

const width = Dimensions.get("window").width - 40

const StackConfig = {
    showLength: 3,
    stackInterval: 15,
    rotateZDeg: 0,
    scaleInterval: 0.05,
    opacityInterval: 0.5,
}

let devices = [...new Array(6).keys()]

export const DeviceCarousel = () => {
    const progressValue = useSharedValue<number>(0)
    const { onScrollBegin, onScrollEnd } = useActiveCard()

    const onProgressChange = useCallback(
        (_: number, absoluteProgress: number) => {
            progressValue.value = absoluteProgress
        },
        [progressValue],
    )

    const renderItem = useCallback(({ index }: { index: number }) => {
        return (
            <Card
                index={index}
                key={index}
                entering={FadeInRight.delay(
                    (devices.length - index) * 50,
                ).duration(200)}
            />
        )
    }, [])

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
                onProgressChange={onProgressChange}
                renderItem={renderItem}
                onScrollBegin={onScrollBegin}
                onScrollEnd={onScrollEnd}
            />

            <BaseSpacer height={10} />

            {!!progressValue && (
                <BaseView
                    orientation="row"
                    justify="space-between"
                    selfAlign="center">
                    {devices.map((_, index) => (
                        <PaginationItem
                            animValue={progressValue}
                            index={index}
                            key={index}
                            length={devices.length}
                            entering={FadeIn.duration(200)}
                        />
                    ))}
                </BaseView>
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
})
