import React from "react"
import { ImageBackground, ImageStyle, StyleProp, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
const assetImage = require("~Assets/Img/make-your-dapp.png")

type MakeYourOwnDAppProps = {
    label: string
    onPress: () => void
}

export const MakeYourOwnDApp = React.memo(({ label, onPress }: MakeYourOwnDAppProps) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseTouchable style={styles.rootContainer} onPress={onPress}>
            <ImageBackground source={assetImage} style={styles.image as StyleProp<ImageStyle>} resizeMode="cover">
                <BaseView px={12} style={styles.text}>
                    <BaseText typographyFont="subTitle" color={COLORS.WHITE}>
                        {label}
                    </BaseText>
                </BaseView>
            </ImageBackground>
            <Icon name={"open-in-new"} size={16} color={COLORS.WHITE} style={styles.iconStyle} />
        </BaseTouchable>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            borderRadius: 12,
            overflow: "hidden",
            marginHorizontal: 24,
        },
        text: {
            width: "60%",
        },
        image: {
            width: "100%",
            height: 100,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        },
        iconStyle: {
            position: "absolute",
            right: 10,
            top: 10,
        },
    })
