import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseView } from "~Components/Base"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Common"

const backButtonHeaderStyle = StyleSheet.create({
    backButton: { paddingHorizontal: 16, alignSelf: "flex-start" },
})

type Props = {
    testID?: string
    iconTestID?: string
}

export const BackButtonHeader = ({ testID, iconTestID }: Props) => {
    const nav = useNavigation()
    const theme = useTheme()
    return (
        <BaseView testID={testID}>
            <BaseIcon
                style={backButtonHeaderStyle.backButton}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={nav.goBack}
                testID={iconTestID}
            />
            <BaseSpacer height={16} />
        </BaseView>
    )
}
