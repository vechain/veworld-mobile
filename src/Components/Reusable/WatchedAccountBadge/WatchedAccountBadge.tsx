import React from "react"
import { BaseText, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    mr?: number
    bg?: string
    textColor?: string
}

export const WatchedAccountBadge: React.FC<Props> = ({ mr, bg, textColor }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <BaseView bg={bg ? bg : theme.colors.text} px={5} py={3.5} borderRadius={6} mr={mr}>
            <BaseText
                typographyFont="smallCaption"
                lineHeight={12}
                style={{ color: textColor ? textColor : theme.colors.textReversed }}>
                {LL.BTN_OBSERVED()}
            </BaseText>
        </BaseView>
    )
}
