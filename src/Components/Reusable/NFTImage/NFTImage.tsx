import React, { memo, useMemo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { SvgUri } from "react-native-svg"
import { NFTPlaceholderDark, NFTPlaceholderLight } from "~Assets"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { URIUtils } from "~Utils"

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

    const cacheControl = useMemo(() => {
        //Return default value (it won't be used)
        if (mime === "image/svg+xml") return FastImage.cacheControl.immutable
        if (!uri) return FastImage.cacheControl.immutable
        const parsedUrl = new URL(uri)
        //If the URL is for an ArWeave resource or IPFS, then it's technically immutable
        //Otherwise respect HTTP headers
        if ([URIUtils.IPFS_GATEWAY_HOSTNAME, URIUtils.ARWEAVE_GATEWAY_HOSTNAME].includes(parsedUrl.hostname))
            return FastImage.cacheControl.immutable
        return FastImage.cacheControl.web
    }, [mime, uri])

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
                    cache: cacheControl,
                }}
                {...rest}
                resizeMode={FastImage.resizeMode.cover}
            />
        )
    }, [cacheControl, mime, placeholderImg, rest, style, testID, theme.colors.placeholder, uri])

    return <BaseView>{renderImageComponent}</BaseView>
})
