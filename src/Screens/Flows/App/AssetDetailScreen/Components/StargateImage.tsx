import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { NFTPlaceholderDark, NFTPlaceholderLight } from "~Assets"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { URIUtils } from "~Utils"

type Props = {
    uri?: string
    testID?: string
}

export const StargateImage = ({ uri, testID }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const placeholderImg = useMemo(() => {
        return theme.isDark ? NFTPlaceholderDark : NFTPlaceholderLight
    }, [theme.isDark])

    const parsedUri = useMemo(() => {
        if (!uri) return undefined
        return URIUtils.convertUriToUrl(uri)
    }, [uri])

    return (
        <BaseView style={styles.root}>
            <FastImage
                testID={testID}
                style={[
                    {
                        backgroundColor: theme.colors.placeholder,
                    },
                    styles.image as ImageStyle,
                ]}
                fallback
                defaultSource={placeholderImg}
                source={{
                    uri: parsedUri,
                    priority: FastImage.priority.low,
                    cache: FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.cover}
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            width: 208,
            height: 160,
            overflow: "hidden",
            borderRadius: 8,
        },
        image: {
            width: 208,
            height: 208,
        },
    })
