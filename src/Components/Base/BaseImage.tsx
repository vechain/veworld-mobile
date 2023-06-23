import React, { memo, useCallback, useState } from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { BaseView } from "./BaseView"
import { BlurView } from "~Components/Reusable"
import { Image, StyleSheet } from "react-native"

type Props = {
    uri: string
    w?: number
    h?: number
    isNFT?: boolean
} & FastImageProps

export const BaseImage = memo((props: Props) => {
    const { uri, w, h, style, testID, isNFT = false, ...rest } = props
    const [isLoading, setIsLoading] = useState(false)

    const onLoadStart = useCallback(() => {
        setIsLoading(true)
    }, [])

    const onLoadEnd = useCallback(() => {
        setIsLoading(false)
    }, [])

    return (
        <BaseView>
            <FastImage
                testID={testID}
                style={[{ width: w, height: h }, style]}
                fallback
                onLoadStart={onLoadStart}
                onLoadEnd={onLoadEnd}
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

            {isLoading && (
                <>
                    <Image
                        style={[
                            baseStyles.placeholder,
                            { width: w, height: h },
                        ]}
                    />
                    <BlurView
                        blurAmount={10}
                        style={[
                            baseStyles.placeholder,
                            { width: w, height: h },
                        ]}
                    />
                </>
            )}
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    placeholder: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 12,
    },
})
