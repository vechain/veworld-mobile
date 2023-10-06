import React, { memo, useEffect, useRef, useState } from "react"
import {
    Audio,
    Video,
    ResizeMode,
    AVPlaybackStatus,
    InterruptionModeAndroid,
    InterruptionModeIOS,
} from "expo-av"
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
const triggerAudio = async (ref: any) => {
    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, // play audio even when phone is on silent mode
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix, // interrupt other apps' audio
        interruptionModeIOS: InterruptionModeIOS.DoNotMix, // interrupt other apps' audio
    })

    ref.current.playAsync()
}

export const NFTVideo = memo((props: Props) => {
    const { uri, style, isPlayAudio } = props
    const ref = useRef(null)
    const [status, setStatus] = useState<AVPlaybackStatus | undefined>()

    useEffect(() => {
        if (!status) return
        if (status.isLoaded && isPlayAudio) triggerAudio(ref)

        return () => {
            ref.current = null
        }
    }, [ref, status, isPlayAudio])

    const theme = useTheme()

    return (
        <BaseView>
            <Video
                volume={isPlayAudio ? 1 : 0}
                usePoster
                ref={ref}
                onPlaybackStatusUpdate={setStatus}
                shouldPlay
                useNativeControls={props.useNativeControls}
                style={[
                    {
                        backgroundColor: theme.colors.placeholder,
                    },
                    style,
                ]}
                source={{ uri }}
                resizeMode={ResizeMode.COVER}
                isLooping
            />
        </BaseView>
    )
})
