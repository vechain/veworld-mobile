import React, { memo, useRef } from "react"
import { Video, ResizeMode } from "expo-av"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    uri: string
    style: any
}

export const NFTVideo = memo((props: Props) => {
    const { uri, style } = props

    const theme = useTheme()

    const video = useRef(null)

    return (
        <BaseView>
            <Video
                usePoster
                ref={video}
                shouldPlay
                useNativeControls
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
