import React, { memo, useCallback } from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"

type Props = {
    isEdit: boolean
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>
}

export const EditTokens = memo(({ isEdit, setIsEdit }: Props) => {
    const theme = useTheme()
    const onButtonPress = useCallback(() => {
        setIsEdit(prevState => !prevState)
    }, [setIsEdit])

    const getActionsButtons = useCallback(() => {
        if (!isEdit)
            return (
                <BaseIcon
                    name="pencil-outline"
                    bg={theme.colors.secondary}
                    action={onButtonPress}
                    size={24}
                />
            )
        return (
            <BaseView flexDirection="row">
                <BaseIcon
                    name="plus"
                    bg={theme.colors.secondary}
                    action={() => console.log("TODO")}
                    size={24}
                    disabled
                    style={{ marginHorizontal: 16 }}
                />
                <BaseIcon
                    name="check"
                    bg={theme.colors.secondary}
                    action={onButtonPress}
                    size={24}
                />
            </BaseView>
        )
    }, [isEdit, theme, onButtonPress])

    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            px={20}
            my={20}>
            <BaseText typographyFont="subTitle">Your Tokens</BaseText>

            {getActionsButtons()}
        </BaseView>
    )
})
