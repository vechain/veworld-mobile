import React, { memo, useCallback } from "react"
import Carousel from "react-native-reanimated-carousel"
import { FadeIn, FadeInRight, useSharedValue } from "react-native-reanimated"
import { StyleSheet, Dimensions } from "react-native"
import { PaginationItem } from "../HeaderView/AccountsCarousel/PaginationItem"
import { BaseSpacer, BaseView } from "~Components"
import { useActiveCard } from "../../Hooks/useActiveCard"
import { Device } from "~Storage"
import { DeviceCard } from "./DeviceCard"

const width = Dimensions.get("window").width - 40

const StackConfig = {
    showLength: 3,
    stackInterval: 15,
    rotateZDeg: 0,
    scaleInterval: 0.05,
    opacityInterval: 0.5,
}

type Props = { devices: Device[] }

export const DevicesCarousel: React.FC<Props> = memo(({ devices }) => {
    const progressValue = useSharedValue<number>(0)
    const onScrollEnd = useActiveCard()

    const onProgressChange = useCallback(
        (_: number, absoluteProgress: number) => {
            progressValue.value = absoluteProgress
        },
        [progressValue],
    )

    const renderItem = useCallback(
        ({ index }: { index: number }) => {
            return (
                <DeviceCard
                    device={devices[index]}
                    key={index}
                    entering={FadeInRight.delay(
                        (devices.length - index) * 50,
                    ).duration(200)}
                />
            )
        },
        [devices],
    )

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
                mode="horizontal-stack"
                data={devices}
                modeConfig={StackConfig}
                onProgressChange={onProgressChange}
                renderItem={renderItem}
                onSnapToItem={onScrollEnd}
            />

            <BaseSpacer height={10} />

            {!!progressValue && (
                <BaseView
                    flexDirection="row"
                    justifyContent="space-between"
                    alignSelf="center">
                    {devices.map((device, index) => (
                        <PaginationItem
                            animValue={progressValue}
                            index={index}
                            key={device.rootAddress}
                            length={devices.length}
                            entering={FadeIn.delay(220).duration(250)}
                        />
                    ))}
                </BaseView>
            )}
        </>
    )
})

const baseStyles = StyleSheet.create({
    carouselContainer: {
        width: "100%",
        height: 190,
        alignItems: "center",
        justifyContent: "center",
    },
})
