import React, { memo, useMemo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { BaseView } from "./BaseView"
import { useTheme } from "~Hooks"

type Props = {
    uri: string
    w?: number
    h?: number
    isNFT?: boolean
} & FastImageProps

export const BaseImage = memo((props: Props) => {
    const { uri, w, h, style, testID, ...rest } = props

    const theme = useTheme()

    const placeholderImg = useMemo(() => {
        return theme.isDark
            ? require("../../Assets/Img/NFTPlaceholder_Dark.png")
            : require("../../Assets/Img/NFTPlaceholder_Light.png")
    }, [theme.isDark])

    return (
        <BaseView>
            <FastImage
                testID={testID}
                style={[
                    { width: w, height: h },
                    style,
                    { backgroundColor: theme.colors.placeholder },
                ]}
                fallback
                // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/749) change fallback image
                defaultSource={placeholderImg}
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
