import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer } from "~Components/Base"
import { useTheme } from "~Hooks"

const style = StyleSheet.create({
    backButton: { paddingHorizontal: 16, alignSelf: "flex-start" },
})

export type CloseModalButtonProps = {
    iconTestID?: string
    hasBottomSpacer?: boolean
    onPress?: (success?: boolean) => void
}

export const CloseModalButton = ({
    iconTestID = "CloseModalButton-BaseIcon-closeModal",
    hasBottomSpacer = true,
    onPress,
}: CloseModalButtonProps) => {
    const theme = useTheme()

    return (
        <>
            <BaseIcon
                style={style.backButton}
                size={36}
                name="icon-chevron-left"
                color={theme.colors.text}
                action={() => onPress?.(false)}
                testID={iconTestID}
            />
            {hasBottomSpacer && <BaseSpacer height={16} />}
        </>
    )
}
