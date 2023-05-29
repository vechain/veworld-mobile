import React, { memo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { SvgXml } from "react-native-svg"
import { PicassoUtils } from "~Utils"
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
    borderRadius?: number
} & ViewProps

export const PicassoAddressIcon: React.FC<PicassoAddressIconProps> = memo(
    ({ address, size = 50, borderRadius = 8, style, ...otherProps }) => {
        const uri = PicassoUtils.getPicassoImgSrc(address).toString()

        return (
            <BaseView
                borderRadius={borderRadius}
                {...otherProps}
                style={[picassoIconStyles.view, style]}>
                <SvgXml xml={uri} width={size} height={size} />
            </BaseView>
        )
    },
)

const picassoIconStyles = StyleSheet.create({
    view: { overflow: "hidden" },
})
