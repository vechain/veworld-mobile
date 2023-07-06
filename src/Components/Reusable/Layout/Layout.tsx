import React, { ReactNode } from "react"
import {
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components/Base"
import { BackButtonHeader } from "../BackButtonHeader"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"

type Props = {
    noBackButton?: boolean
    noMargin?: boolean
    title?: string
    header?: ReactNode
    body?: ReactNode
    footer?: ReactNode
    isScrollEnabled?: boolean
    safeAreaTestID?: string
}

export const Layout = ({
    noBackButton = false,
    noMargin = false,
    title,
    header,
    body,
    footer,
    isScrollEnabled = true,
    safeAreaTestID,
}: Props) => {
    const theme = useTheme()
    return (
        <BaseSafeArea grow={1} testID={safeAreaTestID}>
            <BaseView h={100}>
                {!noBackButton && <BackButtonHeader hasBottomSpacer={false} />}
                <BaseSpacer height={16} />
                <BaseView mx={noMargin ? 0 : 24}>
                    {title && (
                        <BaseText typographyFont="subTitleBold" mb={24}>
                            {title}
                        </BaseText>
                    )}
                    {header && <BaseView>{header}</BaseView>}
                </BaseView>
                {isScrollEnabled && (
                    <BaseSpacer height={1} background={theme.colors.card} />
                )}
                {body && (
                    <BaseScrollView
                        scrollEnabled={isScrollEnabled}
                        style={noMargin ? {} : styles.scrollView}>
                        {body}
                    </BaseScrollView>
                )}
                {footer && <BaseView mx={noMargin ? 0 : 24}>{footer}</BaseView>}
            </BaseView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        paddingHorizontal: 24,
    },
})
