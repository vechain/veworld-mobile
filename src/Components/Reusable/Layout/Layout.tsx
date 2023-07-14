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
import { usePlatformBottomInsets, useTheme } from "~Hooks"

type Props = {
    noBackButton?: boolean
    noMargin?: boolean
    title?: string
    fixedHeader?: ReactNode
    body?: ReactNode
    footer?: ReactNode
    isScrollEnabled?: boolean
    safeAreaTestID?: string
}

export const Layout = ({
    noBackButton = false,
    noMargin = false,
    title,
    fixedHeader,
    body,
    footer,
    isScrollEnabled = true,
    safeAreaTestID,
}: Props) => {
    const theme = useTheme()
    const { tabBarAndroidBottomInsets } = usePlatformBottomInsets()

    const Title = () => (
        <BaseText
            typographyFont="subTitleBold"
            mb={24}
            mt={fixedHeader ? 0 : 8}>
            {title}
        </BaseText>
    )

    return (
        <BaseSafeArea grow={1} testID={safeAreaTestID}>
            <BaseView h={100}>
                {!noBackButton && <BackButtonHeader hasBottomSpacer={false} />}
                <BaseSpacer height={fixedHeader ? 16 : 8} />
                <BaseView mx={noMargin ? 0 : 24}>
                    {fixedHeader && title && <Title />}
                    {fixedHeader && <BaseView>{fixedHeader}</BaseView>}
                </BaseView>
                {isScrollEnabled && (
                    <BaseSpacer height={1} background={theme.colors.card} />
                )}
                {body && (
                    <BaseScrollView
                        scrollEnabled={isScrollEnabled}
                        style={noMargin ? {} : styles.scrollView}>
                        {!fixedHeader && title && <Title />}
                        {body}
                    </BaseScrollView>
                )}
                {footer && (
                    <BaseView
                        mx={noMargin ? 0 : 24}
                        mb={tabBarAndroidBottomInsets}>
                        {footer}
                    </BaseView>
                )}
            </BaseView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        paddingHorizontal: 24,
    },
})
