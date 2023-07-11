import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer } from "~Components/Base"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Hooks"

type Props = {
    iconTestID?: string
    hasBottomSpacer?: boolean
}

export const BackButtonHeader = ({
    iconTestID = "BackButtonHeader-BaseIcon-backButton",
    hasBottomSpacer = true,
}: Props) => {
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
            {hasBottomSpacer && <BaseSpacer height={16} />}
        </>
    )
}

const backButtonHeaderStyle = StyleSheet.create({
    backButton: { paddingHorizontal: 12, alignSelf: "flex-start" },
})
