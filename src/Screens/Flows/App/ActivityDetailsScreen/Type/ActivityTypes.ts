import { TFonts } from "~Constants"

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
