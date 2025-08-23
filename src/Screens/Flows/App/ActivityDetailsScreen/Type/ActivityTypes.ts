import { ReactNode } from "react"
import { TFonts } from "~Constants"
import { IconKey } from "~Model"

export type ActivityDetail = {
    id: number
    eventName?: string
    title: ReactNode
    value: ReactNode
    typographyFont: TFonts
    underline: boolean
    valueAdditional?: string
    icon?: IconKey
    isLoading?: boolean
    onValuePress?: () => void
}
