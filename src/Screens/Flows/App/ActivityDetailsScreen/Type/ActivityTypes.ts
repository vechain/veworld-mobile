import { TFonts } from "~Constants"
import { IconKey } from "~Components"

export type ActivityDetail = {
    id: number
    title: string
    value: string
    typographyFont: TFonts
    underline: boolean
    valueAdditional?: string
    icon?: IconKey
    onValuePress?: () => void
}
