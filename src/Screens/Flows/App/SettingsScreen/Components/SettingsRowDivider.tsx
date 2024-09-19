import React from "react"
import { BaseSpacer } from "~Components"
import { useTheme } from "~Hooks"

export type RowDividerProps = {
    title: string
    height: number
}

const SettingsRowDivider: React.FC<RowDividerProps> = ({ title, height }) => {
    const theme = useTheme()

    return <BaseSpacer aria-label={title} height={height} background={theme.colors.placeholder} />
}

export default SettingsRowDivider
