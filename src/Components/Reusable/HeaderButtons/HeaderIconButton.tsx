import React, { ReactNode } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    children: ReactNode
    testID?: string
    action: () => void
}

export const HeaderIconButton = ({ children, testID, action }: Props) => {
    const theme = useTheme()

    return (
        <TouchableOpacity testID={testID} onPress={action} activeOpacity={0.7}>
            <BaseView
                p={7}
                bg={theme.colors.card}
                flexDirection="row"
                style={[styles.container, { borderColor: theme.colors.rightIconHeaderBorder }]}>
                {children}
            </BaseView>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 32,
        borderWidth: 1,
        borderRadius: 6,
        alignContent: "space-between",
    },
})
