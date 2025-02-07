import React, { memo, useMemo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { useTheme } from "~Hooks"
import { BaseView } from "~Components/Base"
import { NFTPlaceholderDark, NFTPlaceholderLight } from "~Assets"
import { SvgUri } from "react-native-svg"

type Props = {
    uri?: string
    mime?: string
} & FastImageProps

export const NFTImage = memo((props: Props) => {
    const { uri, style, testID, mime, ...rest } = props

    const theme = useTheme()

    const placeholderImg = useMemo(() => {
        return theme.isDark ? NFTPlaceholderDark : NFTPlaceholderLight
    }, [theme.isDark])

    const renderImageComponent = useMemo(() => {
        if (mime && mime === "image/svg+xml") {
            return (
                <BaseView
                    style={[
                        {
                            backgroundColor: theme.colors.placeholder,
                        },
                        style,
                    ]}>
                    {uri ? (
                        <SvgUri
                            uri={uri}
                            testID={testID}
                            height={"100%"}
                            width={"100%"}
                            fallback={
                                <FastImage
                                    fallback
                                    defaultSource={placeholderImg}
                                    style={[style]}
                                    resizeMode={FastImage.resizeMode.cover}
                                />
                            }
                        />
                    ) : (
                        <FastImage
                            fallback
                            defaultSource={placeholderImg}
                            style={[style]}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    )}
                </BaseView>
            )
        }

        return (
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
        )
    }, [mime, placeholderImg, rest, style, testID, theme.colors.placeholder, uri])

    return <BaseView>{renderImageComponent}</BaseView>
})
