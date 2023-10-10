import React, { memo, useMemo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { useTheme } from "~Hooks"
import { BaseView } from "~Components/Base"
import { NFTPlaceholderDark, NFTPlaceholderLight } from "~Assets"

type Props = {
    uri?: string
} & FastImageProps

export const NFTImage = memo((props: Props) => {
    const { uri, style, testID, ...rest } = props

    const theme = useTheme()

    const placeholderImg = useMemo(() => {
        return theme.isDark ? NFTPlaceholderDark : NFTPlaceholderLight
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
