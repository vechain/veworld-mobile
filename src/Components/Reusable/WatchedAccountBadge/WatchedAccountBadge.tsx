import React from "react"
import { useTheme } from "~Hooks"
import { BaseText, BaseView } from "~Components/Base"
import { useI18nContext } from "~i18n"

type Props = {
    mr?: number
    bg?: string
}

export const WatchedAccountBadge: React.FC<Props> = ({ mr, bg }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <BaseView bg={bg ? bg : theme.colors.text} px={5} py={3.5} borderRadius={6} mr={mr}>
            <BaseText typographyFont="caption" style={{ color: theme.colors.textReversed }}>
                {LL.BTN_OBSERVED()}
            </BaseText>
        </BaseView>
    )
}
