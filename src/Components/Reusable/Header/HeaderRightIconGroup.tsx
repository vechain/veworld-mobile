import React, { ReactNode } from "react"
import { StyleSheet } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"

type HeaderRightButtonsProps = {
    rightElement: ReactNode
}

export const HeaderRightIconGroup: React.FC<HeaderRightButtonsProps> = ({ rightElement }) => {
    const { styles } = useThemedStyles(baseStyle)

    return (
        <BaseView style={styles.rightContainer} accessibilityLabel="">
            {rightElement}
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        rightContainer: {
            flexBasis: 24,
            flexShrink: 0,
            flexGrow: 1,
            gap: 8,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
        },
    })
