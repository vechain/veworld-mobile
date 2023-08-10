import React, { ReactNode, useCallback } from "react"
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
import { PlatformUtils } from "~Utils"
import { SelectedNetworkViewer } from "~Components/Reusable/SelectedNetworkViewer/SelectedNetworkViewer"

type Props = {
    noBackButton?: boolean
    noMargin?: boolean
    title?: string
    fixedHeader?: ReactNode
    body?: ReactNode
    bodyWithoutScrollView?: ReactNode
    footer?: ReactNode
    isScrollEnabled?: boolean
    safeAreaTestID?: string
    scrollViewTestID?: string
    showSelectedNetwork?: boolean
    onTouchBody?: () => void
}

export const Layout = ({
    noBackButton = false,
    noMargin = false,
    title,
    fixedHeader,
    body,
    bodyWithoutScrollView,
    footer,
    isScrollEnabled = true,
    safeAreaTestID,
    onTouchBody,
    scrollViewTestID,
    showSelectedNetwork = false,
}: Props) => {
    const theme = useTheme()
    const { tabBarAndroidBottomInsets, calculateBottomInsets } =
        usePlatformBottomInsets()

    const Title = useCallback(
        () => (
            <BaseText typographyFont="title" mb={24} mt={fixedHeader ? 0 : 8}>
                {title}
            </BaseText>
        ),
        [fixedHeader, title],
    )

    return (
        <BaseSafeArea
            grow={1}
            testID={safeAreaTestID}
            onTouchStart={onTouchBody}>
            <BaseView h={100}>
                <BaseView>
                    {!noBackButton && (
                        <BackButtonHeader hasBottomSpacer={false} />
                    )}
                    <BaseView>
                        <BaseSpacer height={fixedHeader ? 16 : 8} />
                        <BaseView mx={noMargin ? 0 : 20}>
                            {fixedHeader && title && <Title />}
                            {fixedHeader && <BaseView>{fixedHeader}</BaseView>}
                        </BaseView>
                    </BaseView>
                    {showSelectedNetwork && (
                        <BaseView style={styles.selectedNetworkViewerView}>
                            <SelectedNetworkViewer />
                        </BaseView>
                    )}
                    {!fixedHeader && <BaseSpacer height={8} />}
                </BaseView>
                {/* Separator from header to body */}
                <BaseSpacer height={1} background={theme.colors.card} />

                {body && (
                    <BaseScrollView
                        testID={scrollViewTestID || "Layout_ScrollView"}
                        scrollEnabled={isScrollEnabled}
                        style={noMargin ? {} : styles.scrollView}
                        contentContainerStyle={{
                            paddingBottom: calculateBottomInsets,
                        }}>
                        {!fixedHeader && title && <Title />}
                        {body}
                        {footer && PlatformUtils.isAndroid() && (
                            <BaseSpacer height={tabBarAndroidBottomInsets} />
                        )}
                    </BaseScrollView>
                )}
                {bodyWithoutScrollView}
                {footer && (
                    <BaseView
                        mx={noMargin ? 0 : 20}
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
    selectedNetworkViewerView: {
        position: "absolute",
        right: 22,
        top: 5,
    },
})
