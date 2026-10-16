import { setAudioModeAsync } from "expo-audio"
import { useVideoPlayer, VideoView } from "expo-video"
import React, { memo, useEffect } from "react"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    uri: string
    style: any
    isPlayAudio: boolean
    useNativeControls: boolean
}

// Workaround to play audio on iOS
// https://stackoverflow.com/a/74493514/7977491
const triggerAudio = () =>
    setAudioModeAsync({
        playsInSilentMode: true, // play audio even when phone is on silent mode
        interruptionMode: "doNotMix", // interrupt other apps' audio
    })

export const NFTVideo = memo((props: Props) => {
    const { uri, style, isPlayAudio } = props

    const player = useVideoPlayer(uri, instance => {
        instance.loop = true
        instance.volume = isPlayAudio ? 1 : 0
        instance.play()
    })

    useEffect(() => {
        if (isPlayAudio) triggerAudio()
    }, [isPlayAudio])

    const theme = useTheme()

    return (
        <BaseView>
            <VideoView
                player={player}
                nativeControls={props.useNativeControls}
                style={[
                    {
                        backgroundColor: theme.colors.placeholder,
                    },
                    style,
                ]}
                contentFit="cover"
            />
        </BaseView>
    )
})
