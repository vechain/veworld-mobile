import React from "react"
import { SvgProps } from "react-native-svg"
import { LedgerLogo } from "~Assets"
import { useTheme } from "~Common"
import { BaseView } from "~Components/Base"
import { Props as BaseViewProps } from "~Components/Base/BaseView"

type Props = {
    containerStyle?: BaseViewProps
    logoStyle?: SvgProps
}
export const LedgerBadge: React.FC<Props> = ({ containerStyle, logoStyle }) => {
    const theme = useTheme()

    return (
        <BaseView
            bg={theme.colors.text}
            px={5}
            py={3.5}
            borderRadius={6}
            {...containerStyle}>
            <LedgerLogo
                color={theme.colors.textReversed}
                width={35}
                height={12.5}
                {...logoStyle}
            />
        </BaseView>
    )
}
