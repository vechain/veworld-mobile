import React, { ReactNode } from "react"
import { BaseScrollView, BaseSpacer, BaseView } from "~Components/Base"

interface Props {
    children: ReactNode
    footer: ReactNode
}

export const ScrollViewWithFooter = ({ children, footer }: Props) => {
    return (
        <BaseView flexGrow={1} alignItems={"stretch"}>
            <BaseScrollView>
                <BaseView alignItems={"stretch"}>{children}</BaseView>
                {/** here we can add a fade like effect */}
            </BaseScrollView>
            <BaseSpacer height={16} />
            <BaseView alignItems={"stretch"}>{footer}</BaseView>
        </BaseView>
    )
}
