import React, { ReactNode } from "react"
import { StyleProp, ViewProps } from "react-native"
import { BackButtonGenericHeader } from "./BackButtonGenericHeader"
import { HeaderRightIconGroup } from "./HeaderRightIconGroup"
import { HeaderTitle } from "./HeaderTitle"

type Props = {
    iconTestID?: string
    title?: string
    hasBottomSpacer?: boolean
    iconColor?: string
    beforeNavigating?: () => Promise<void> | void
    action?: () => void
    onGoBack?: () => void
    preventGoBack?: boolean
    iconStyle?: StyleProp<ViewProps>
    rightElement?: ReactNode
} & ViewProps

export const BackButtonHeader = ({
    iconTestID = "BackButtonHeader-BaseIcon-backButton",
    title,
    rightElement,
    ...otherProps
}: Props) => {
    return (
        <BackButtonGenericHeader
            rightElement={
                <>
                    {!!title && <HeaderTitle title={title} />}
                    <HeaderRightIconGroup rightElement={rightElement} />
                </>
            }
            iconTestID={iconTestID}
            {...otherProps}
        />
    )
}
