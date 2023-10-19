import React, { memo, useCallback, useEffect, useRef } from "react"
import {
    Audio,
    Video,
    ResizeMode,
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
const triggerAudio = async (ref: React.RefObject<Video>) => {
    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, // play audio even when phone is on silent mode
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix, // interrupt other apps' audio
        interruptionModeIOS: InterruptionModeIOS.DoNotMix, // interrupt other apps' audio
    })

    await ref?.current?.playAsync()
}

export const NFTVideo = memo((props: Props) => {
    const { uri, style, isPlayAudio } = props
    const ref = useRef<Video>(null)
    const firstLoadRef = useRef(true)

    const initPLayback = useCallback(async () => {
        if (isPlayAudio) await triggerAudio(ref)
    }, [isPlayAudio])

    useEffect(() => {
        if (firstLoadRef.current) {
            initPLayback()
            firstLoadRef.current = false
            return
        }
    }, [initPLayback])

    const theme = useTheme()

    return (
        <BaseView>
            <Video
                volume={isPlayAudio ? 1 : 0}
                usePoster
                ref={ref}
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
