import React from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
}

export const AddTabHeaderButton = ({ action, testID = "AddTab-HeaderIcon" }: Props) => {
    const theme = useTheme()

    return (
        <TouchableOpacity testID={testID} onPress={action} activeOpacity={0.7}>
            <BaseView
                p={2}
                flexDirection="row"
                style={[
                    styles.container,
                    { borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300 },
                ]}>
                <BaseIcon size={16} name="icon-plus" color={theme.colors.text} />
            </BaseView>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: 22,
        borderWidth: 2,
        borderRadius: 4,
        alignContent: "space-between",
    },
})
