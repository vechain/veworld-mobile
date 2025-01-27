import React, { ReactNode } from "react"
import { BaseView } from "~Components"
import { StyleSheet } from "react-native"

type HeaderRightButtonsProps = {
    rightElement: ReactNode
}

export const HeaderRightIconGroup: React.FC<HeaderRightButtonsProps> = ({ rightElement }) => {
    return (
        <BaseView style={baseStyle.rightContainer}>
            <BaseView style={baseStyle.rightContent}>{rightElement}</BaseView>
        </BaseView>
    )
}

const baseStyle = StyleSheet.create({
    rightContainer: {
        width: 24,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    rightContent: {
        position: "absolute",
    },
})
