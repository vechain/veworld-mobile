import React from "react"
import { SvgProps } from "react-native-svg"
import { LedgerLogo } from "~Assets"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    mr?: number
    bg?: string
    logoStyle?: SvgProps
}

export const LedgerBadge: React.FC<Props> = ({ mr, bg, logoStyle }) => {
    const theme = useTheme()

    return (
        <BaseView
            bg={bg ? bg : theme.colors.text}
            px={5}
            py={3.5}
            borderRadius={6}
            mr={mr}>
            <LedgerLogo
                color={theme.colors.textReversed}
                width={35}
                height={12.5}
                {...logoStyle}
            />
        </BaseView>
    )
}
