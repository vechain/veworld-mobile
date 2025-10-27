import React, { memo } from "react"
import { FastImageProps } from "react-native-fast-image"
import { BaseView } from "~Components/Base"
import { NFTImageComponent } from "./NFTImageComponent"

type Props = {
    uri?: string
    mime?: string
} & FastImageProps

export const NFTImage = memo((props: Props) => {
    return (
        <BaseView>
            <NFTImageComponent {...props} />
        </BaseView>
    )
})
