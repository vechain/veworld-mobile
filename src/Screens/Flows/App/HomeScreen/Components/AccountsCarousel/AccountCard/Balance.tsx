import React, { useMemo } from "react"
import { FormattingUtils, useDisclosure, useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"

const { humanNumber } = FormattingUtils

type Props = {
    balance: string
}
export const Balance: React.FC<Props> = ({ balance }) => {
    const theme = useTheme()

    const { isOpen: isVisible, onToggle: toggleVisible } = useDisclosure(true)

    const balanceText = useMemo(() => {
        if (isVisible) return humanNumber(balance)
        return Array.from(Array(humanNumber(balance).length).keys()).map(
            _value => "*",
        )
    }, [balance, isVisible])
    return (
        <>
            <BaseView orientation="row" align="center">
                <BaseText
                    color={theme.colors.textReversed}
                    typographyFont="body">
                    Your balance
                </BaseText>
                <BaseIcon
                    onPress={toggleVisible}
                    name={isVisible ? "eye-off-outline" : "eye-outline"}
                    color={theme.colors.textReversed}
                    size={18}
                />
            </BaseView>
            <BaseView orientation="row" align="flex-end">
                <BaseText
                    color={theme.colors.textReversed}
                    typographyFont="hugeTitle">
                    {balanceText}
                </BaseText>
                <BaseText
                    mx={4}
                    color={theme.colors.textReversed}
                    typographyFont="body">
                    USD
                </BaseText>
            </BaseView>
        </>
    )
}
