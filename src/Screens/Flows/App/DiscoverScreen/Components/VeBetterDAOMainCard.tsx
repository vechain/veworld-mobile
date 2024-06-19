import React from "react"
import { StyleSheet, useWindowDimensions } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { VeBetterBaoDarkSVG } from "~Assets"
import { BaseTouchable } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type VeBetterDAOMainCardProps = {
    href: string
    onDAppPress: ({ href, custom }: { href: string; custom?: boolean }) => void
}

export const VeBetterDAOMainCard = React.memo(({ href, onDAppPress }: VeBetterDAOMainCardProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { width: windowWidth } = useWindowDimensions()
    const svgWidth = windowWidth - 96

    return (
        <BaseTouchable style={[styles.headerContainer, theme.shadows.card]} action={() => onDAppPress({ href })}>
            <VeBetterBaoDarkSVG width={svgWidth} height={162} />
            <Icon name={"open-in-new"} size={16} color={COLORS.DARK_PURPLE} style={styles.iconStyle} />
        </BaseTouchable>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        headerContainer: {
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#B1F16C",
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 24,
        },
        iconStyle: {
            position: "absolute",
            right: 10,
            top: 10,
        },
    })
