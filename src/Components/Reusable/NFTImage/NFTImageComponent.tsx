import React, { memo, useMemo } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { SvgUri } from "react-native-svg"
import { NFTPlaceholderDarkV2 } from "~Assets"
import { BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { URIUtils } from "~Utils"

type Props = {
    uri: string | undefined
    mime?: string
} & FastImageProps

export const NFTImageComponent = memo((props: Props) => {
    const { uri, style, testID, mime, ...rest } = props

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

    if (mime && mime === "image/svg+xml") {
        return (
            <BaseView
                style={[
                    {
                        backgroundColor: COLORS.PURPLE,
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
                                defaultSource={NFTPlaceholderDarkV2}
                                style={[style]}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        }
                    />
                ) : (
                    <FastImage
                        fallback
                        defaultSource={NFTPlaceholderDarkV2}
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
                    backgroundColor: COLORS.PURPLE,
                },
                style,
            ]}
            fallback
            defaultSource={NFTPlaceholderDarkV2}
            source={{
                uri,
                priority: FastImage.priority.low,
                cache: cacheControl,
            }}
            resizeMode={FastImage.resizeMode.cover}
            {...rest}
        />
    )
})
