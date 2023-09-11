import React, { ReactNode } from "react"
import { BaseScrollView, BaseSpacer, BaseView } from "~Components/Base"

type Props = {
    children: ReactNode
    footer: ReactNode
    isScrollEnabled?: boolean
}

export const ScrollViewWithFooter = ({
    children,
    footer,
    isScrollEnabled = true,
}: Props) => {
    return (
        <BaseView flex={1} alignItems={"stretch"}>
            <BaseScrollView scrollEnabled={isScrollEnabled}>
                <BaseView>{children}</BaseView>
                {/** here we can add a fade like effect */}
            </BaseScrollView>
            <BaseSpacer height={16} />
            <BaseView>{footer}</BaseView>
        </BaseView>
    )
}
