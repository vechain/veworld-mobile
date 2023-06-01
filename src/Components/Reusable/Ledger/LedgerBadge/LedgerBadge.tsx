import React from "react"
import { useTheme } from "~Common"
import { BaseText, BaseView } from "~Components/Base"

export const LedgerBadge: React.FC = () => {
    const theme = useTheme()

    return (
        <BaseView>
            <BaseView bg={theme.colors.text} px={4} py={2} borderRadius={6}>
                <BaseText
                    typographyFont="smallCaptionBold"
                    color={theme.colors.textReversed}>
                    {"LEDGER"}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
