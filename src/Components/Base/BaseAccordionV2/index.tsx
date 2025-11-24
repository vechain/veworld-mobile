import React from "react"
import { BaseView, BaseViewProps } from "~Components"
import { useTheme } from "~Hooks"
import { BaseAccordionV2Content } from "./BaseAccordionV2Content"
import { BaseAccordionV2ContentDescription } from "./BaseAccordionV2ContentDescription"
import { BaseAccordionV2Provider } from "./BaseAccordionV2Context"
import { BaseAccordionV2Header } from "./BaseAccordionV2Header"
import { BaseAccordionV2HeaderIcon } from "./BaseAccordionV2HeaderIcon"
import { BaseAccordionV2HeaderText } from "./BaseAccordionV2HeaderText"

const BaseAccordionV2 = ({ children, ...props }: BaseViewProps) => {
    const theme = useTheme()
    return (
        <BaseAccordionV2Provider>
            <BaseView flexDirection="column" bg={theme.colors.card} borderRadius={8} {...props}>
                {children}
            </BaseView>
        </BaseAccordionV2Provider>
    )
}

BaseAccordionV2.Header = BaseAccordionV2Header
BaseAccordionV2.Content = BaseAccordionV2Content
BaseAccordionV2.ContentDescription = BaseAccordionV2ContentDescription
BaseAccordionV2.HeaderIcon = BaseAccordionV2HeaderIcon
BaseAccordionV2.HeaderText = BaseAccordionV2HeaderText

export { BaseAccordionV2 }
