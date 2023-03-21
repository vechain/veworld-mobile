import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer } from "~Components/Base"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Common"

const backButtonHeaderStyle = StyleSheet.create({
    backButton: { paddingHorizontal: 16, alignSelf: "flex-start" },
})

type Props = {
    iconTestID?: string
}

export const BackButtonHeader = ({ iconTestID }: Props) => {
    const nav = useNavigation()
    const theme = useTheme()
    return (
        <>
            <BaseIcon
                style={backButtonHeaderStyle.backButton}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={nav.goBack}
                testID={iconTestID}
            />
            <BaseSpacer height={16} />
        </>
    )
}
