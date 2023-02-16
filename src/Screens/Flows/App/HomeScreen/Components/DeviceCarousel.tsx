import React, { memo, useCallback, useMemo } from "react"
import Carousel from "react-native-reanimated-carousel"
import { FadeIn, FadeInRight, useSharedValue } from "react-native-reanimated"
import { StyleSheet, Dimensions } from "react-native"
import { PaginationItem } from "./PaginationItem"
import { Card } from "./Card"
import { BaseSpacer, BaseView } from "~Components"
import { useActiveCard } from "../Hooks/useActiveCard"
import { devices_mock } from "~Common"
import { Device, useStoreQuery } from "~Storage"

const width = Dimensions.get("window").width - 40

const StackConfig = {
    showLength: 3,
    stackInterval: 15,
    rotateZDeg: 0,
    scaleInterval: 0.05,
    opacityInterval: 0.5,
}

export const DeviceCarousel = memo(() => {
    const progressValue = useSharedValue<number>(0)
    const { onScrollBegin, onScrollEnd } = useActiveCard()

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    const onProgressChange = useCallback(
        (_: number, absoluteProgress: number) => {
            progressValue.value = absoluteProgress
        },
        [progressValue],
    )

    const renderItem = useCallback(
        ({ index }: { index: number }) => {
            return (
                <Card
                    device={devices[index]}
                    key={index}
                    entering={FadeInRight.delay(
                        (devices_mock.length - index) * 50,
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
                mode={"horizontal-stack"}
                data={devices as unknown as Device[]}
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
