import React, { ReactNode } from "react"
import { View, ViewProps } from "react-native"
import { BaseView, BaseSpacer } from "~Components/Base"
import { HeaderStyle } from "./utils/HeaderStyle"
import { HeaderTitle } from "./HeaderTitle"
import { HeaderRightIconGroup } from "./HeaderRightIconGroup"

type Props = {
    title: string
    rightElement?: ReactNode
    hasBottomSpacer?: boolean
} & ViewProps

export const CenteredHeader = ({ title, rightElement, hasBottomSpacer = false, ...otherProps }: Props) => {
    return (
        <View {...otherProps}>
            <BaseView>
                <BaseView w={100} style={HeaderStyle.headerContainer}>
                    <BaseSpacer width={24} />
                    <HeaderTitle title={title} />
                    <HeaderRightIconGroup rightElement={rightElement} />
                </BaseView>
                {hasBottomSpacer && <BaseSpacer height={24} />}
            </BaseView>
        </View>
    )
}
