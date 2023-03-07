import React, { memo, useCallback } from "react"
import { BaseButton, BaseText, BaseView } from "~Components"

type Props = {
    isEdit: boolean
    action: React.Dispatch<React.SetStateAction<boolean>>
}

export const EditTokens = memo(({ isEdit, action }: Props) => {
    const onButtonPress = useCallback(() => {
        action(prevState => !prevState)
    }, [action])

    return (
        <BaseView
            orientation="row"
            justify="space-between"
            align="center"
            px={20}
            my={20}>
            <BaseText typographyFont="subTitle">Your Tokens</BaseText>
            <BaseButton
                bgColor={isEdit ? "red" : "green"}
                title="Edit"
                action={onButtonPress}
            />
        </BaseView>
    )
})
