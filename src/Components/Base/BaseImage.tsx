import React, { memo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { BaseView } from "./BaseView"

type Props = {
    uri: string
    w?: number
    h?: number
    isNFT?: boolean
} & FastImageProps

export const BaseImage = memo((props: Props) => {
    const { uri, w, h, style, testID, ...rest } = props

    return (
        <BaseView>
            <FastImage
                testID={testID}
                style={[{ width: w, height: h }, style]}
                fallback
                // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/749) change fallback image
                defaultSource={require("../../Assets/Img/NFTPlaceholder.png")}
                source={{
                    uri,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                }}
                {...rest}
                resizeMode={FastImage.resizeMode.cover}
            />
        </BaseView>
    )
})
