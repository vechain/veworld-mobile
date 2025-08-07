import React, { JSXElementConstructor, ReactElement, ReactNode, Ref, useMemo, useState } from "react"
import { RefreshControlProps, ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BackButtonHeader, CenteredHeader, SelectedNetworkViewer } from "~Components"
import { BaseSafeArea, BaseScrollView, BaseView } from "~Components/Base"
import { useTabBarBottomMargin } from "~Hooks"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

type Props = {
    noBackButton?: boolean
    noMargin?: boolean
    title?: string
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
    headerRightElement?: ReactNode
    bg?: string
}

export const Layout = ({
    noBackButton = false,
    noMargin = false,
    title,
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
    headerRightElement,
    bg,
}: Props) => {
    const { androidOnlyTabBarBottomMargin, tabBarBottomMargin } = useTabBarBottomMargin()

    // this value is for automate bottom padding instead of having to set a custom padding
    let STATIC_BOTTOM_PADDING = useMemo(() => {
        if (noStaticBottomPadding) return 0

        // this is because when the bottom tab bar is not present the device bottom line takes space (the one to come back home)
        return tabBarBottomMargin ? 24 : 40
    }, [noStaticBottomPadding, tabBarBottomMargin])

    const [scrollViewHeight, setScrollViewHeight] = useState(0)
    const [scrollViewContentHeight, setScrollViewContentHeight] = useState(0)

    const renderContent = useMemo(
        () => (
            <BaseView h={100} bg={bg}>
                <BaseView>
                    {!noBackButton ? (
                        <BaseView mx={noMargin ? 0 : 16}>
                            <BackButtonHeader
                                beforeNavigating={beforeNavigating}
                                hasBottomSpacer={false}
                                onGoBack={onGoBack}
                                preventGoBack={preventGoBack}
                                title={title}
                                rightElement={headerRightElement}
                            />
                        </BaseView>
                    ) : (
                        title && (
                            <BaseView mx={noMargin ? 0 : 16}>
                                <CenteredHeader title={title} rightElement={headerRightElement} />
                            </BaseView>
                        )
                    )}
                    {fixedHeader && (
                        <BaseView justifyContent="center" px={noMargin ? 0 : 16}>
                            <BaseView>{fixedHeader}</BaseView>
                        </BaseView>
                    )}
                    {showSelectedNetwork && (
                        <BaseView style={styles.selectedNetworkViewerView}>
                            <SelectedNetworkViewer />
                        </BaseView>
                    )}
                </BaseView>

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
                        testID={scrollViewTestID ?? "Layout_ScrollView"}
                        scrollEnabled={scrollViewContentHeight > scrollViewHeight}
                        style={noMargin ? {} : styles.scrollView}
                        contentContainerStyle={{
                            paddingBottom: isAndroid() ? androidOnlyTabBarBottomMargin : _iosOnlyTabBarBottomMargin,
                        }}>
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
                        mx={noMargin ? 0 : 16}>
                        {footer}
                    </BaseView>
                )}
            </BaseView>
        ),
        [
            bg,
            noBackButton,
            noMargin,
            beforeNavigating,
            onGoBack,
            preventGoBack,
            title,
            headerRightElement,
            fixedHeader,
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
            <BaseSafeArea grow={1} testID={safeAreaTestID} onTouchStart={onTouchBody} bg={bg}>
                {renderContent}
            </BaseSafeArea>
        )
    } else if (hasTopSafeAreaOnly) {
        return (
            <SafeAreaView onTouchStart={onTouchBody} edges={["top"]} style={{ backgroundColor: bg }}>
                {renderContent}
            </SafeAreaView>
        )
    } else {
        return <>{renderContent}</>
    }
}

const styles = StyleSheet.create({
    scrollView: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    selectedNetworkViewerView: {
        position: "absolute",
        right: 22,
        top: 5,
    },
})
