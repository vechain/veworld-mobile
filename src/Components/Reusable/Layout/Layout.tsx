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
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { SelectedNetworkViewer } from "~Components"

type Props = {
    noBackButton?: boolean
    noMargin?: boolean
    title?: string
    fixedHeader?: ReactNode
    body?: ReactNode
    fixedBody?: ReactNode
    footer?: ReactNode
    isScrollEnabled?: boolean
    safeAreaTestID?: string
    scrollViewTestID?: string
    showSelectedNetwork?: boolean
    onTouchBody?: () => void
    _iosSpecificBottomInsetsIfIos?: number
    refreshControl?: ReactNode
}

export const Layout = ({
    noBackButton = false,
    noMargin = false,
    title,
    fixedHeader,
    body,
    fixedBody,
    footer,
    isScrollEnabled = true,
    safeAreaTestID,
    onTouchBody,
    scrollViewTestID,
    _iosSpecificBottomInsetsIfIos,
    showSelectedNetwork = false,
    refreshControl,
}: Props) => {
    const theme = useTheme()
    const { androidSpecificBottomInsetsIfAndroid, platformBottomInsets } =
        usePlatformBottomInsets()

    const Title = useCallback(
        () => (
            <BaseText typographyFont="title" mb={16}>
                {title}
            </BaseText>
        ),
        [title],
    )

    return (
        <BaseSafeArea
            grow={1}
            testID={safeAreaTestID}
            onTouchStart={onTouchBody}>
            <BaseView h={100}>
                <BaseView>
                    {!noBackButton && (
                        <>
                            <BackButtonHeader hasBottomSpacer={false} />
                            <BaseSpacer height={8} />
                        </>
                    )}
                    {fixedHeader && (
                        <BaseView>
                            <BaseView mx={noMargin ? 0 : 20}>
                                {title && <Title />}
                                {<BaseView>{fixedHeader}</BaseView>}
                            </BaseView>
                            {!noMargin && <BaseSpacer height={16} />}
                        </BaseView>
                    )}
                    {showSelectedNetwork && (
                        <BaseView style={styles.selectedNetworkViewerView}>
                            <SelectedNetworkViewer />
                        </BaseView>
                    )}
                </BaseView>
                {/* Separator from header to body */}
                <BaseSpacer height={1} background={theme.colors.card} />

                {body && (
                    <BaseScrollView
                        refreshControl={refreshControl}
                        testID={scrollViewTestID || "Layout_ScrollView"}
                        scrollEnabled={isScrollEnabled}
                        style={noMargin ? {} : styles.scrollView}
                        // eslint-disable-next-line react-native/no-inline-styles
                        contentContainerStyle={{
                            paddingBottom: isAndroid()
                                ? androidSpecificBottomInsetsIfAndroid
                                : _iosSpecificBottomInsetsIfIos,
                            paddingTop: noMargin ? 0 : 16,
                        }}>
                        {!fixedHeader && title && <Title />}
                        {body}
                        {footer && <BaseSpacer height={platformBottomInsets} />}
                    </BaseScrollView>
                )}
                {fixedBody && (
                    <>
                        {fixedBody}
                        <BaseView mb={androidSpecificBottomInsetsIfAndroid} />
                    </>
                )}
                {footer && (
                    <BaseView
                        mb={androidSpecificBottomInsetsIfAndroid}
                        mx={noMargin ? 0 : 20}>
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
