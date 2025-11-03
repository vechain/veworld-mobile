import React, { ReactNode } from "react"
import { StyleProp, ViewProps } from "react-native"
import { BaseTextProps } from "~Components/Base"
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
    textAlignment?: BaseTextProps["align"]
} & ViewProps

export const BackButtonHeader = ({
    iconTestID = "BackButtonHeader-BaseIcon-backButton",
    title,
    rightElement,
    textAlignment,
    ...otherProps
}: Props) => {
    return (
        <BackButtonGenericHeader
            rightElement={
                <>
                    {!!title && <HeaderTitle title={title} align={textAlignment} />}
                    <HeaderRightIconGroup rightElement={rightElement} />
                </>
            }
            iconTestID={iconTestID}
            {...otherProps}
        />
    )
}
