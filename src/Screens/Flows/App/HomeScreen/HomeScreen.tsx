import React from "react"
// import React, { useMemo } from "react"
// import { Device, useStoreQuery } from "~Storage"
import { DeviceCarousel } from "./Components/DeviceCarousel"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

export const HomeScreen = () => {
    // todo: this is a workaround until the new version is installed
    // const result = useStoreQuery(Device)
    // const devices = useMemo(() => result.sorted("rootAddress"), [result])

    return (
        <BaseSafeArea>
            <BaseView align="center">
                <BaseView align="flex-start" selfAlign="flex-start" mx={20}>
                    <BaseText font={Fonts.body}>Welcome to</BaseText>
                    <BaseText font={Fonts.large_title}>VeWorld</BaseText>
                </BaseView>

                <BaseSpacer height={20} />

                <DeviceCarousel />
            </BaseView>
        </BaseSafeArea>
    )
}
