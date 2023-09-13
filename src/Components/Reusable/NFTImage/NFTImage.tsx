import React, { memo, useMemo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { useTheme } from "~Hooks"
import { BaseView } from "~Components/Base"

type Props = {
    uri?: string
} & FastImageProps

export const NFTImage = memo((props: Props) => {
    const { uri, style, testID, ...rest } = props

    const theme = useTheme()

    const placeholderImg = useMemo(() => {
        return theme.isDark
            ? require("../../../Assets/Img/NFTPlaceholder_Dark.png")
            : require("../../../Assets/Img/NFTPlaceholder_Light.png")
    }, [theme.isDark])

    return (
        <BaseView>
            <FastImage
                testID={testID}
                style={[
                    {
                        backgroundColor: theme.colors.placeholder,
                    },
                    style,
                ]}
                fallback
                // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/749) change fallback image
                defaultSource={placeholderImg}
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
