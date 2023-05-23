import React, { ReactNode } from "react"
import { BaseScrollView, BaseSpacer, BaseView } from "~Components/Base"

interface Props {
    children: ReactNode
    footer: ReactNode
}

export const ScrollViewWithFooter = ({ children, footer }: Props) => {
    return (
        <BaseView h={100} alignItems={"stretch"}>
            <BaseScrollView>
                <BaseView>{children}</BaseView>
                {/** here we can add a fade like effect */}
            </BaseScrollView>
            <BaseSpacer height={16} />
            <BaseView>{footer}</BaseView>
        </BaseView>
    )
}
