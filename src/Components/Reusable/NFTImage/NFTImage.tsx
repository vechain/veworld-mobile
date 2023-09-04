import React, { memo, useCallback, useMemo, useState } from "react"
import { Image, StyleSheet } from "react-native"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { BaseView } from "~Components/Base"
import { BlurView } from "../BlurView"
import { useTheme } from "~Hooks"

type Props = {
    uri: string
    w?: number
    h?: number
} & FastImageProps

export const NFTImage = memo((props: Props) => {
    const { uri, w, h, style, testID, ...rest } = props
    const [isLoading, setIsLoading] = useState(false)

    const theme = useTheme()

    const onLoadStart = useCallback(() => {
        setIsLoading(true)
    }, [])

    const onLoadEnd = useCallback(() => {
        setIsLoading(false)
    }, [])

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
                    { width: w, height: h },
                    style,
                    {
                        backgroundColor: theme.colors.placeholder,
                    },
                ]}
                onLoadStart={onLoadStart}
                onLoadEnd={onLoadEnd}
                defaultSource={placeholderImg} // not working on android dev only
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
                            // @ts-ignore
                            style,
                            { width: w, height: h },
                        ]}
                    />
                    <BlurView
                        blurAmount={10}
                        style={[
                            baseStyles.placeholder,
                            style,
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
