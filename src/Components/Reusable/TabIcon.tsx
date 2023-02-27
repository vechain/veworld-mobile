import React, { FC, memo } from "react"
import { StyleSheet, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useTheme } from "~Common"
import { BaseView } from "~Components/Base"

type Props = {
    focused: boolean
    title: string
}

export const TabIcon: FC<Props> = memo(({ focused, title }) => {
    const theme = useTheme()

    return (
        <BaseView
            background={focused ? "#CDE599" : undefined}
            justify="center"
            align="center"
            style={baseStyles.container}>
            <Icon
                name={
                    focused
                        ? title.toLocaleLowerCase()
                        : `${title.toLocaleLowerCase()}-outline`
                }
                size={22}
                color={focused ? theme.colors.text : theme.colors.primary}
            />

            {focused && <View style={baseStyles.dot} />}
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    container: { borderRadius: 8, height: 44, width: 44 },
    dot: {
        height: 5,
        width: 5,
        backgroundColor: "black",
        borderRadius: 5,
        marginTop: 2,
    },
})
