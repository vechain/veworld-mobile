import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { useTheme, useNFTMedia } from "~Hooks"
import { NFTMediaType, NFTMedia as Media } from "~Model"
import { error } from "~Utils"
import { NFTVideo } from "../NFTVideo"
import { StyleSheet } from "react-native"
import { BaseImage, BaseView } from "~Components/Base"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

type Props = {
    uri?: string
    styles: any
}

export const NFTMedia = memo((props: Props) => {
    const { uri, styles } = props
    const [isLoading, setIsLoading] = useState(true)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [tokenMedia, setTokenMedia] = useState<Media>()
    const theme = useTheme()

    const onLoadEnd = useCallback(() => {
        setIsLoading(false)
    }, [])

    const { fetchMedia } = useNFTMedia()

    useEffect(() => {
        if (!isLoading) return
    }, [isLoading])

    useEffect(() => {
        if (!uri) return
        fetchMedia(uri)
            .then(media => {
                setTokenMedia(media)
            })
            .catch(e => {
                error(e)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri])

    useEffect(() => {
        if (!isLoading && timeoutRef?.current) {
            clearTimeout(timeoutRef.current)
            return
        }
        // Set a timeout for 5 seconds to automatically set `isLoading` to false
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false)
        }, 5000)

        return () => {
            // Clear the timer when the component unmounts or when uri changes
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [isLoading])

    return (
        <BaseView>
            {tokenMedia?.mediaType === NFTMediaType.VIDEO ? (
                <NFTVideo uri={tokenMedia.image} style={[styles]} />
            ) : (
                <BaseImage
                    {...props}
                    uri={tokenMedia?.image}
                    onLoadEnd={onLoadEnd}
                    onError={onLoadEnd}
                    style={[
                        styles,
                        // eslint-disable-next-line react-native/no-inline-styles
                        { opacity: isLoading ? 0 : 1 },
                    ]}
                />
            )}
            {isLoading && tokenMedia?.mediaType !== NFTMediaType.VIDEO && (
                <SkeletonContent
                    containerStyle={baseStyles.skeletonContainer}
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    layout={[{ ...styles, opacity: 0.5 }]}
                    isLoading={true}
                />
            )}
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    skeletonContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
})
