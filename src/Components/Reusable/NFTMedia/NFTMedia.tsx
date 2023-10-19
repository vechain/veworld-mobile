import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useTheme, useNFTMedia, useThemedStyles } from "~Hooks"
import { NFTMediaType, NFTMedia as Media } from "~Model"
import { error } from "~Utils"
import { NFTVideo } from "../NFTVideo"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components/Base"
import Skeleton from "react-native-reanimated-skeleton"
import { NFTImage } from "../NFTImage"
import { LongPressProvider } from "../LongPressProvider"
// @ts-ignore
import ProgressBar from "react-native-progress/Bar"
import { useSaveMediaToPhotos } from "./Hooks"

type Props = {
    uri?: string
    nftName?: string
    styles: any
    isUseLongPress?: boolean
    isPlayAudio?: boolean
    useNativeControls?: boolean
}

export const NFTMedia = memo(
    ({
        uri,
        nftName,
        styles,
        isUseLongPress = false,
        isPlayAudio = false,
        useNativeControls = false,
        ...restProps
    }: Props) => {
        const [isLoading, setIsLoading] = useState(true)
        const timeoutRef = useRef<NodeJS.Timeout | null>(null)
        const [tokenMedia, setTokenMedia] = useState<Media>()
        const theme = useTheme()

        const { styles: themedStyles } = useThemedStyles(baseStyles(isLoading))

        const { LongPressItems, onLongPressImage, progress } =
            useSaveMediaToPhotos(tokenMedia, nftName)

        const onLoadEnd = useCallback(() => {
            setIsLoading(false)
        }, [])

        const onError = useCallback(() => {
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
        }, [fetchMedia, uri])

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

        const RenderNFT = useMemo(() => {
            return tokenMedia?.mediaType === NFTMediaType.VIDEO ? (
                <NFTVideo
                    uri={tokenMedia.image}
                    style={[styles]}
                    isPlayAudio={isPlayAudio}
                    useNativeControls={useNativeControls}
                />
            ) : (
                <NFTImage
                    {...restProps}
                    uri={tokenMedia?.image}
                    onLoadEnd={onLoadEnd}
                    onError={onError}
                    style={[styles, themedStyles.imageOpacity]}
                />
            )
        }, [
            isPlayAudio,
            onError,
            onLoadEnd,
            restProps,
            styles,
            themedStyles.imageOpacity,
            tokenMedia?.image,
            tokenMedia?.mediaType,
            useNativeControls,
        ])

        const RenderImageWithProvider = useMemo(() => {
            if (isUseLongPress) {
                return (
                    <LongPressProvider
                        items={LongPressItems}
                        action={onLongPressImage}>
                        {RenderNFT}
                    </LongPressProvider>
                )
            } else {
                return RenderNFT
            }
        }, [LongPressItems, RenderNFT, isUseLongPress, onLongPressImage])

        return (
            <BaseView>
                {RenderImageWithProvider}
                {isLoading && tokenMedia?.mediaType !== NFTMediaType.VIDEO && (
                    <Skeleton
                        containerStyle={themedStyles.skeletonContainer}
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        layout={[{ ...styles, opacity: 0.5 }]}
                        isLoading={true}
                    />
                )}

                {progress > 0 ? (
                    <>
                        <BaseView
                            style={themedStyles.progressOverlay}
                            bg={theme.colors.card}>
                            <ProgressBar
                                useNativeDriver
                                progress={progress}
                                width={200}
                                color={theme.colors.secondary}
                            />
                        </BaseView>
                    </>
                ) : null}
            </BaseView>
        )
    },
)

const baseStyles = (isLoading: boolean) => () =>
    StyleSheet.create({
        skeletonContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        imageOpacity: { opacity: isLoading ? 0 : 1 },
        progressOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
        },
    })
