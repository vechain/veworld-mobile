import React, { ReactNode } from "react"
import { ViewProps } from "react-native"
import { BaseView, BaseSpacer } from "~Components/Base"
import { HeaderTitle } from "./HeaderTitle"
import { HeaderRightIconGroup } from "./HeaderRightIconGroup"
import { HeaderStyle } from "~Constants"

type Props = {
    title: string
    rightElement?: ReactNode
    hasBottomSpacer?: boolean
} & ViewProps

export const CenteredHeader = ({ title, rightElement, hasBottomSpacer = false, ...otherProps }: Props) => {
    return (
        <BaseView {...otherProps}>
            <BaseView w={100} style={HeaderStyle}>
                <BaseSpacer width={24} />
                <HeaderTitle title={title} />
                <HeaderRightIconGroup rightElement={rightElement} />
            </BaseView>
            {hasBottomSpacer && <BaseSpacer height={24} />}
        </BaseView>
    )
}
