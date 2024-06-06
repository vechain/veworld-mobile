import React, { memo, useState } from "react"
import { Image, StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { SCREEN_WIDTH } from "~Constants"

type IconProps = {
    imageSource: object
}

export const DAppIcon: React.FC<IconProps> = memo(({ imageSource }: IconProps) => {
    const [loadFallback, setLoadFallback] = useState(false)

    return (
        <BaseView style={baseStyles.iconContainer}>
            <Image
                source={loadFallback ? require("~Assets/Img/dapp-fallback.png") : imageSource}
                // @ts-ignore
                style={baseStyles.icon}
                onError={() => setLoadFallback(true)}
                resizeMode="cover"
            />
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    iconContainer: {
        backgroundColor: "white",
        borderRadius: 13,
        overflow: "hidden",
        height: 60,
        width: SCREEN_WIDTH / 4 - 36,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        height: 60,
        width: SCREEN_WIDTH / 4 - 36,
    },
})
