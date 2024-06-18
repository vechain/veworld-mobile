import React from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"

type MakeYourOwnDAppProps = {
    label: string
    onPress: () => void
}

export const MakeYourOwnDApp = React.memo(({ label, onPress }: MakeYourOwnDAppProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseTouchable style={[styles.rootContainer, { backgroundColor: theme.colors.card }]} onPress={onPress}>
            <BaseView flex={0.4} px={12}>
                <BaseText typographyFont="subTitle">{label}</BaseText>
            </BaseView>
            <BaseView flex={0.6}>
                <Image
                    source={require("../../../../../Assets/Img/NFTPlaceholder.png")}
                    style={styles.image as StyleProp<ImageStyle>}
                    resizeMode="cover"
                />
                <Icon name={"open-in-new"} size={16} color={theme.colors.primary} style={styles.iconStyle} />
            </BaseView>
        </BaseTouchable>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            overflow: "hidden",
            marginHorizontal: 24,
        },
        text: {
            width: "40%",
        },
        image: {
            width: 200,
            height: 100,
        },
        iconStyle: {
            position: "absolute",
            right: 10,
            top: 10,
        },
    })
