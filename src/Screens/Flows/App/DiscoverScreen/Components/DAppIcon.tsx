import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type DAppIconProps = {
    imageSource: object
}

export const DAppIcon: React.FC<DAppIconProps> = ({ imageSource }: DAppIconProps) => {
    const [loadFallback, setLoadFallback] = useState(false)
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView borderRadius={20} bg={COLORS.WHITE} style={styles.iconContainer}>
            <Image
                source={loadFallback ? require("~Assets/Img/dapp-fallback.png") : imageSource}
                style={styles.icon as StyleProp<ImageStyle>}
                onError={() => setLoadFallback(true)}
            />
        </BaseView>
    )
}

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
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
        },
    })
