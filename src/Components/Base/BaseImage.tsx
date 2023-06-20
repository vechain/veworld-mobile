import React, { memo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"

type Props = {
    uri: string
    w?: number
    h?: number
    isNFT?: boolean
} & FastImageProps

export const BaseImage = memo((props: Props) => {
    const { uri, w, h, style, testID, isNFT = false, ...rest } = props

    return (
        <FastImage
            testID={testID}
            style={[{ width: w, height: h }, style]}
            fallback
            // todo -> change fallback for not NFTs
            defaultSource={
                isNFT
                    ? require("../../Assets/Img/NFTPlaceholder.png")
                    : require("../../Assets/Img/NFTPlaceholder.png")
            }
            source={{
                uri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
            }}
            {...rest}
            resizeMode={FastImage.resizeMode.cover}
        />
    )
})
