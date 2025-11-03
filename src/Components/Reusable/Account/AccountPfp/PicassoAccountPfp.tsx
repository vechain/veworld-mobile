import React, { memo } from "react"
import { SvgXml } from "react-native-svg"
import { PicassoUtils } from "~Utils"
import { BaseAccountPfp, BaseAccountPfpProps } from "./BaseAccountPfp"

type Props = {
    address: string
} & BaseAccountPfpProps

export const PicassoAccountPfp = memo<Props>(({ address, size = 50, ...otherProps }) => {
    const uri = PicassoUtils.getPicassoImgSrc(address).toString()

    return (
        <BaseAccountPfp size={size} {...otherProps}>
            <SvgXml xml={uri} width={size} height={size} />
        </BaseAccountPfp>
    )
})
