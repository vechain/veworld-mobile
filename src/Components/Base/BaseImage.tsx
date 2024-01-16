import React, { memo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { BaseView } from "./BaseView"

type Props = {
    uri?: string
} & FastImageProps

export const BaseImage = memo((props: Props) => {
    const { uri, style, testID, ...rest } = props
    return (
        <BaseView>
            <FastImage
                testID={testID}
                style={style}
                fallback
                // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/749) change fallback image
                source={{
                    uri,
                    priority: FastImage.priority.low,
                    cache: FastImage.cacheControl.immutable,
                }}
                {...rest}
                resizeMode={FastImage.resizeMode.cover}
            />
        </BaseView>
    )
})
