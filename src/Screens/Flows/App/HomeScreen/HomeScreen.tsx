import React, { useMemo } from "react"
import { DeviceCarousel } from "./Components/DeviceCarousel"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"
import {
    ActiveWalletCard,
    useCachedQuery,
    Device,
    useStoreQuery,
} from "~Storage"

export const HomeScreen = () => {
    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    // todo: this is a workaround until the new version is installed
    const result2 = useCachedQuery(ActiveWalletCard)
    const activeCard = useMemo(() => result2.sorted("_id"), [result2])

    console.log(devices)
    console.log(activeCard)

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
