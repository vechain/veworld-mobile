import { TFonts } from "~Common/Theme"

export type ActivityDetail = {
    id: number
    title: string
    value: string
    typographyFont: TFonts
    underline: boolean
    valueAdditional?: string
    icon?: string
    onValuePress?: () => void
}
