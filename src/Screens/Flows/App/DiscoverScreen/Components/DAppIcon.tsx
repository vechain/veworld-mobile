import React, { memo, useState } from "react"
import { Image, StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"

type IconProps = {
    imageSource: object
}

export const DAppIcon: React.FC<IconProps> = memo(({ imageSource }: IconProps) => {
    const [loadFallback, setLoadFallback] = useState(false)
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView borderRadius={20} bg={COLORS.WHITE} style={styles.iconContainer}>
            <Image
                source={loadFallback ? require("~Assets/Img/dapp-fallback.png") : imageSource}
                // @ts-ignore
                style={styles.icon}
                onError={() => setLoadFallback(true)}
            />
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            borderWidth: 1,
            borderColor: theme.colors.text,
            borderRadius: 20.5,
            overflow: "hidden",
            padding: 0,
            width: 41,
            height: 41,
        },
        icon: {
            height: 40,
            width: 40,
            objectFit: "cover",
        },
    })
