// Copied from @gorhom/bottom-sheet library
// The only change that was done was to remove the update of the content height of the bottomsheet
// When the content size changes.
// For example with lists inside BS, if there was something other than the list, it'd caused the list to be truncated because it'd set the height of the BS
// To the height of the list

import {
    BottomSheetDraggableView,
    GESTURE_SOURCE,
    SCROLLABLE_DECELERATION_RATE_MAPPER,
    SCROLLABLE_STATE,
    SCROLLABLE_TYPE,
    useBottomSheetInternal,
    useScrollHandler,
    useScrollableSetter,
} from "@gorhom/bottom-sheet"
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import { Platform, StyleSheet } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"
import { useAnimatedProps, useAnimatedStyle } from "react-native-reanimated"
import { useStableCallback } from "~Hooks/useStableCallback"
import BottomSheetRefreshControl from "./BottomSheetRefreshControl"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "visible",
    },
})

export function createBottomSheetScrollableComponent<T, P>(type: SCROLLABLE_TYPE, ScrollableComponent: any) {
    return forwardRef<T, P>((props, ref) => {
        // props
        const {
            // hooks
            focusHook,
            scrollEventsHandlersHook,
            // props
            enableFooterMarginAdjustment = false,
            overScrollMode = "never",
            keyboardDismissMode = "interactive",
            showsVerticalScrollIndicator = true,
            style,
            refreshing,
            onRefresh,
            progressViewOffset,
            refreshControl,
            // events
            onScroll,
            onScrollBeginDrag,
            onScrollEndDrag,
            onContentSizeChange,
            ...rest
        }: any = props

        //#region refs
        const nativeGestureRef = useRef<NativeViewGestureHandler>(null)
        const refreshControlGestureRef = useRef<NativeViewGestureHandler>(null)
        //#endregion

        //#region hooks
        const { scrollableRef, scrollableContentOffsetY, scrollHandler } = useScrollHandler(
            scrollEventsHandlersHook,
            onScroll,
            onScrollBeginDrag,
            onScrollEndDrag,
        )
        const { enableContentPanningGesture, animatedFooterHeight, animatedScrollableState } = useBottomSheetInternal()
        //#endregion

        //#region variables
        const scrollableAnimatedProps = useAnimatedProps(
            () => ({
                decelerationRate: SCROLLABLE_DECELERATION_RATE_MAPPER[animatedScrollableState.value],
                showsVerticalScrollIndicator: showsVerticalScrollIndicator
                    ? animatedScrollableState.value === SCROLLABLE_STATE.UNLOCKED
                    : showsVerticalScrollIndicator,
            }),
            [showsVerticalScrollIndicator],
        )
        //#endregion

        //#region callbacks
        const handleContentSizeChange = useStableCallback((contentWidth: number, contentHeight: number) => {
            if (onContentSizeChange) {
                onContentSizeChange(contentWidth, contentHeight)
            }
        })
        //#endregion

        //#region styles
        const containerAnimatedStyle = useAnimatedStyle(
            () => ({
                marginBottom: enableFooterMarginAdjustment ? animatedFooterHeight.value : 0,
            }),
            [enableFooterMarginAdjustment],
        )
        const containerStyle = useMemo(() => {
            return enableFooterMarginAdjustment
                ? [...(style ? ("length" in style ? style : [style]) : []), containerAnimatedStyle]
                : style
        }, [enableFooterMarginAdjustment, style, containerAnimatedStyle])
        //#endregion

        //#region effects
        // @ts-ignore
        useImperativeHandle(ref, () => scrollableRef.current)
        useScrollableSetter(scrollableRef, type, scrollableContentOffsetY, onRefresh !== undefined, focusHook)
        //#endregion

        //#region render
        if (Platform.OS === "android") {
            const scrollableContent = (
                <NativeViewGestureHandler
                    ref={nativeGestureRef}
                    enabled={enableContentPanningGesture}
                    shouldCancelWhenOutside={false}>
                    <ScrollableComponent
                        animatedProps={scrollableAnimatedProps}
                        {...rest}
                        scrollEventThrottle={16}
                        ref={scrollableRef}
                        overScrollMode={overScrollMode}
                        keyboardDismissMode={keyboardDismissMode}
                        onScroll={scrollHandler}
                        onContentSizeChange={handleContentSizeChange}
                        style={containerStyle}
                    />
                </NativeViewGestureHandler>
            )
            return (
                <BottomSheetDraggableView
                    nativeGestureRef={nativeGestureRef}
                    refreshControlGestureRef={refreshControlGestureRef}
                    gestureType={GESTURE_SOURCE.SCROLLABLE}
                    style={styles.container}>
                    {onRefresh ? (
                        <BottomSheetRefreshControl
                            ref={refreshControlGestureRef}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            progressViewOffset={progressViewOffset}
                            style={styles.container}>
                            {scrollableContent}
                        </BottomSheetRefreshControl>
                    ) : (
                        scrollableContent
                    )}
                </BottomSheetDraggableView>
            )
        }
        return (
            <BottomSheetDraggableView
                nativeGestureRef={nativeGestureRef}
                gestureType={GESTURE_SOURCE.SCROLLABLE}
                style={styles.container}>
                <NativeViewGestureHandler
                    ref={nativeGestureRef}
                    enabled={enableContentPanningGesture}
                    shouldCancelWhenOutside={false}>
                    <ScrollableComponent
                        animatedProps={scrollableAnimatedProps}
                        {...rest}
                        scrollEventThrottle={16}
                        ref={scrollableRef}
                        overScrollMode={overScrollMode}
                        keyboardDismissMode={keyboardDismissMode}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={progressViewOffset}
                        refreshControl={refreshControl}
                        onScroll={scrollHandler}
                        onContentSizeChange={handleContentSizeChange}
                        style={containerStyle}
                    />
                </NativeViewGestureHandler>
            </BottomSheetDraggableView>
        )
        //#endregion
    })
}
