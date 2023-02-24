import React from "react"
import { StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

type Props = {
    action: () => void
    children: React.ReactNode
}
export const BaseTouchableBox: React.FC<Props> = ({ action, children }) => {
    return (
        <TouchableOpacity onPress={action} style={styles.container}>
            {children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        width: "100%",
        alignItems: "stretch",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
    },
})
