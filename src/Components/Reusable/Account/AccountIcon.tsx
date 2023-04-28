import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { SvgXml } from "react-native-svg"
import { PicassoUtils } from "~Common"
import { BaseView } from "~Components/Base"

type AccountIconProps = {
    address: string
}

export const AccountIcon: React.FC<AccountIconProps> = memo(({ address }) => {
    return (
        <BaseView>
            <PicassoAddressIcon address={address} />
        </BaseView>
    )
})

type PicassoAddressIconProps = {
    address: string
    size?: number
}
const PicassoAddressIcon: React.FC<PicassoAddressIconProps> = memo(
    ({ address, size = 50 }) => {
        const uri = PicassoUtils.getPicassoImgSrc(address).toString()

        return (
            <BaseView borderRadius={8} style={picassoIconStyles.view}>
                <SvgXml xml={uri} width={size} height={size} />
            </BaseView>
        )
    },
)

const picassoIconStyles = StyleSheet.create({
    view: { overflow: "hidden" },
})
