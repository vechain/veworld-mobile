import React, { memo } from "react"
import { Image } from "react-native"
import { BaseAccountPfp, BaseAccountPfpProps } from "./BaseAccountPfp"

type Props = {
    uri: string
} & BaseAccountPfpProps

export const LocalFileAccountPfp = memo<Props>(({ uri, size = 50, ...props }) => {
    return (
        <BaseAccountPfp size={size} {...props}>
            <Image source={{ uri }} width={size} height={size} resizeMethod="scale" />
        </BaseAccountPfp>
    )
})
