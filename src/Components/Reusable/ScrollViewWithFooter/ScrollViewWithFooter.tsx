import React, { ReactNode } from "react"
import { BaseScrollView, BaseSpacer, BaseView } from "~Components/Base"

interface Props {
    children: ReactNode
    footer: ReactNode
}

export const ScrollViewWithFooter = ({ children, footer }: Props) => {
    return (
        <BaseView flexGrow={1}>
            <BaseScrollView>
                <BaseView>{children}</BaseView>
                {/** here we can add a fade like effect */}
            </BaseScrollView>
            <BaseSpacer height={16} />
            <BaseView>{footer}</BaseView>
        </BaseView>
    )
}
