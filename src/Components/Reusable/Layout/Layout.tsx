import React, {
    JSXElementConstructor,
    ReactElement,
    ReactNode,
    Ref,
    useCallback,
    useMemo,
} from "react"
import {
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components/Base"
import { BackButtonHeader } from "../BackButtonHeader"
import { RefreshControlProps, ScrollView, StyleSheet } from "react-native"
import { useTabBarBottomMargin, useTheme } from "~Hooks"
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
    _iosOnlyTabBarBottomMargin?: number
    refreshControl?: ReactElement<
        RefreshControlProps,
        string | JSXElementConstructor<any>
    >
    noStaticBottomPadding?: boolean
    scrollViewRef?: Ref<ScrollView>
    onGoBack?: () => void
    hasSafeArea?: boolean
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
    _iosOnlyTabBarBottomMargin,
    showSelectedNetwork = false,
    refreshControl,
    noStaticBottomPadding = false, // this is often used with components with FadeoutButton (that have padding to show the fade effect)
    scrollViewRef,
    onGoBack,
    hasSafeArea = true,
}: Props) => {
    const theme = useTheme()
    const { androidOnlyTabBarBottomMargin, tabBarBottomMargin } =
        useTabBarBottomMargin()

    // this value is for automate bottom padding instead of having to set a custom padding
    let STATIC_BOTTOM_PADDING = useMemo(() => {
        if (noStaticBottomPadding) return 0

        return tabBarBottomMargin ? 24 : 40 // this is because when the bottom tab bar is not present the device bottom line takes space (the one to come back home)
    }, [noStaticBottomPadding, tabBarBottomMargin])

    const Title = useCallback(
        () => (
            <BaseText typographyFont="title" mb={16}>
                {title}
            </BaseText>
        ),
        [title],
    )

    const renderContent = useMemo(
        () => (
            <BaseView h={100}>
                <BaseView>
                    {!noBackButton && (
                        <>
                            <BackButtonHeader
                                hasBottomSpacer={false}
                                onGoBack={onGoBack}
                            />
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
                {(!noBackButton || fixedHeader) && (
                    <BaseSpacer height={1} background={theme.colors.card} />
                )}

                {body && (
                    <BaseScrollView
                        ref={scrollViewRef}
                        refreshControl={refreshControl}
                        testID={scrollViewTestID || "Layout_ScrollView"}
                        scrollEnabled={isScrollEnabled}
                        style={noMargin ? {} : styles.scrollView}
                        // eslint-disable-next-line react-native/no-inline-styles
                        contentContainerStyle={{
                            paddingBottom: isAndroid()
                                ? androidOnlyTabBarBottomMargin
                                : _iosOnlyTabBarBottomMargin,
                            paddingTop: noMargin ? 0 : 16,
                        }}>
                        {!fixedHeader && title && <Title />}
                        {body}
                    </BaseScrollView>
                )}
                {fixedBody && (
                    <>
                        {fixedBody}
                        <BaseView mb={androidOnlyTabBarBottomMargin} />
                    </>
                )}
                {footer && (
                    <BaseView
                        mb={
                            noMargin
                                ? 0
                                : Number(androidOnlyTabBarBottomMargin) +
                                  STATIC_BOTTOM_PADDING
                        }
                        mx={noMargin ? 0 : 20}>
                        {footer}
                    </BaseView>
                )}
            </BaseView>
        ),
        [
            STATIC_BOTTOM_PADDING,
            Title,
            _iosOnlyTabBarBottomMargin,
            androidOnlyTabBarBottomMargin,
            body,
            fixedBody,
            fixedHeader,
            footer,
            isScrollEnabled,
            noBackButton,
            noMargin,
            onGoBack,
            refreshControl,
            scrollViewRef,
            scrollViewTestID,
            showSelectedNetwork,
            theme.colors.card,
            title,
        ],
    )

    if (hasSafeArea) {
        return (
            <BaseSafeArea
                grow={1}
                testID={safeAreaTestID}
                onTouchStart={onTouchBody}>
                {renderContent}
            </BaseSafeArea>
        )
    } else {
        return <>{renderContent}</>
    }
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
