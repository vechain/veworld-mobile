import React from "react"
import DropShadow from "react-native-drop-shadow"
import { useTheme } from "~Common"
import { BaseText, BaseView } from "~Components/Base"

export const LedgerBadge: React.FC = () => {
    const theme = useTheme()

    return (
        <DropShadow style={[theme.shadows.card]}>
            <BaseView bg={theme.colors.text} px={4} py={2} borderRadius={6}>
                <BaseText
                    typographyFont="smallCaptionBold"
                    color={theme.colors.textReversed}>
                    {"LEDGER"}
                </BaseText>
            </BaseView>
        </DropShadow>
    )
}
