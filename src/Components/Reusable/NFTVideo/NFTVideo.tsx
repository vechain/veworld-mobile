import React, { memo, useRef } from "react"
import { StyleSheet } from "react-native"
import { SCREEN_WIDTH } from "~Constants"
import { Video, ResizeMode } from "expo-av"
import { BaseView } from "~Components/Base"
import { info } from "~Utils"

type Props = {
    uri: string
}

export const NFTVideo = memo((props: Props) => {
    const { uri } = props

    const video = useRef(null)

    info("Loading NFT video")

    return (
        <BaseView style={baseStyles.nftImage}>
            <Video
                usePoster
                ref={video}
                shouldPlay
                useNativeControls
                style={baseStyles.nftImage}
                source={{ uri }}
                resizeMode={ResizeMode.COVER}
                isLooping
            />
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    nftImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        width: "100%",
        height: SCREEN_WIDTH - 40,
        overflow: "hidden",
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
})
