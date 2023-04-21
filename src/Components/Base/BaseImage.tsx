import React from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"

type Props = {
    uri: string
    w?: number
    h?: number
} & FastImageProps

export const BaseImage = (props: Props) => {
    const { uri, w, h, style, testID, ...rest } = props

    return (
        <FastImage
            testID={testID}
            style={[{ width: w, height: h }, style]}
            source={{
                uri,
                priority: FastImage.priority.normal,
            }}
            {...rest}
            resizeMode={FastImage.resizeMode.contain}
        />
    )
}
