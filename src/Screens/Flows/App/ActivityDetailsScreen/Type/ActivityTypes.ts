import { TFonts } from "~Constants"
import { IconKey } from "~Model"

export type ActivityDetail = {
    id: number
    eventName?: string
    title: string
    value: string
    typographyFont: TFonts
    underline: boolean
    valueAdditional?: string
    icon?: IconKey
    isLoading?: boolean
    onValuePress?: () => void
}
