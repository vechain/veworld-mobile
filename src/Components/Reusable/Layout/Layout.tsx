import React, { JSXElementConstructor, ReactElement, ReactNode, Ref, useCallback, useMemo, useState } from "react"
import { BaseSafeArea, BaseScrollView, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BackButtonHeader } from "../BackButtonHeader"
import { RefreshControlProps, ScrollView, StyleSheet } from "react-native"
import { useTabBarBottomMargin } from "~Hooks"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { SelectedNetworkViewer } from "~Components"
import { SafeAreaView } from "react-native-safe-area-context"
import { BackButtonHeaderV2 } from "~Components/Reusable/BackButtonHeader/BackButtonHeaderV2"

type Props = {
    noBackButton?: boolean
    noMargin?: boolean
    title?: string
    pageHeader?: string
    fixedHeader?: ReactNode
    body?: ReactNode
    fixedBody?: ReactNode
    footer?: ReactNode
    safeAreaTestID?: string
    scrollViewTestID?: string
    showSelectedNetwork?: boolean
    onTouchBody?: () => void
    _iosOnlyTabBarBottomMargin?: number
    refreshControl?: ReactElement<RefreshControlProps, string | JSXElementConstructor<any>>
    noStaticBottomPadding?: boolean
    scrollViewRef?: Ref<ScrollView>
    onGoBack?: () => void
    preventGoBack?: boolean
    beforeNavigating?: () => Promise<void> | void
    hasSafeArea?: boolean
    hasTopSafeAreaOnly?: boolean
}

export const Layout = ({
    noBackButton = false,
    noMargin = false,
    title,
    pageHeader,
    fixedHeader,
    body,
    fixedBody,
    footer,
    safeAreaTestID,
    onTouchBody,
    scrollViewTestID,
    _iosOnlyTabBarBottomMargin,
    showSelectedNetwork = false,
    refreshControl,
    // this is often used with components with FadeoutButton (that have padding to show the fade effect)
    noStaticBottomPadding = false,
    scrollViewRef,
    onGoBack,
    preventGoBack = false,
    beforeNavigating,
    hasSafeArea = true,
    hasTopSafeAreaOnly = false,
}: Props) => {
    const { androidOnlyTabBarBottomMargin, tabBarBottomMargin } = useTabBarBottomMargin()

    // this value is for automate bottom padding instead of having to set a custom padding
    let STATIC_BOTTOM_PADDING = useMemo(() => {
        if (noStaticBottomPadding) return 0

        // this is because when the bottom tab bar is not present the device bottom line takes space (the one to come back home)
        return tabBarBottomMargin ? 24 : 40
    }, [noStaticBottomPadding, tabBarBottomMargin])

    const Title = useCallback(
        () => (
            <BaseText typographyFont="title" mb={16}>
                {title}
            </BaseText>
        ),
        [title],
    )

    const [scrollViewHeight, setScrollViewHeight] = useState(0)
    const [scrollViewContentHeight, setScrollViewContentHeight] = useState(0)

    const renderContent = useMemo(
        () => (
            <BaseView h={100}>
                <BaseView>
                    {!noBackButton && (
                        <>
                            <BackButtonHeader
                                beforeNavigating={beforeNavigating}
                                hasBottomSpacer={false}
                                onGoBack={onGoBack}
                                preventGoBack={preventGoBack}
                            />
                            <BaseSpacer height={8} />
                        </>
                    )}
                    {pageHeader && (
                        <BaseView>
                            <BaseView mx={noMargin ? 0 : 20}>
                                <BackButtonHeaderV2 title={pageHeader} />
                            </BaseView>
                        </BaseView>
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

                {body && (
                    <BaseScrollView
                        onContentSizeChange={(_w: number, h: number) => {
                            setScrollViewContentHeight(h)
                        }}
                        onLayout={event => {
                            const { height } = event.nativeEvent.layout
                            setScrollViewHeight(height)
                        }}
                        ref={scrollViewRef}
                        refreshControl={refreshControl}
                        testID={scrollViewTestID || "Layout_ScrollView"}
                        scrollEnabled={scrollViewContentHeight > scrollViewHeight}
                        style={noMargin ? {} : styles.scrollView}
                        // eslint-disable-next-line react-native/no-inline-styles
                        contentContainerStyle={{
                            paddingBottom: isAndroid() ? androidOnlyTabBarBottomMargin : _iosOnlyTabBarBottomMargin,
                            paddingTop: noMargin ? 0 : 16,
                        }}>
                        {!fixedHeader && title && <Title />}
                        {body}
                    </BaseScrollView>
                )}
                {fixedBody && (
                    <>
                        {fixedBody}
                        <BaseView mb={!hasTopSafeAreaOnly ? androidOnlyTabBarBottomMargin : undefined} />
                    </>
                )}
                {footer && (
                    <BaseView
                        mb={noMargin ? 0 : Number(androidOnlyTabBarBottomMargin) + STATIC_BOTTOM_PADDING}
                        mx={noMargin ? 0 : 20}>
                        {footer}
                    </BaseView>
                )}
            </BaseView>
        ),
        [
            noBackButton,
            beforeNavigating,
            onGoBack,
            preventGoBack,
            pageHeader,
            fixedHeader,
            noMargin,
            title,
            Title,
            showSelectedNetwork,
            body,
            scrollViewRef,
            refreshControl,
            scrollViewTestID,
            scrollViewContentHeight,
            scrollViewHeight,
            androidOnlyTabBarBottomMargin,
            _iosOnlyTabBarBottomMargin,
            fixedBody,
            hasTopSafeAreaOnly,
            footer,
            STATIC_BOTTOM_PADDING,
        ],
    )

    if (hasSafeArea) {
        return (
            <BaseSafeArea grow={1} testID={safeAreaTestID} onTouchStart={onTouchBody}>
                {renderContent}
            </BaseSafeArea>
        )
    } else if (hasTopSafeAreaOnly) {
        return (
            <SafeAreaView onTouchStart={onTouchBody} edges={["top"]}>
                {renderContent}
            </SafeAreaView>
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
