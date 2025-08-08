import React, { useCallback, useEffect } from "react"
import { ImageBackground, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { setChangelogToShow, useAppDispatch } from "~Storage/Redux"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"

type VbdCarouselBottomSheetProps = {
    bannerUri?: string
    iconUri?: string
    category?: (typeof AVAILABLE_CATEGORIES)[number]
    app: VeBetterDaoDapp & VeBetterDaoDAppMetadata
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const VbdCarouselBottomSheet = ({
    isOpen,
    setIsOpen,
    bannerUri,
    iconUri,
    category,
    app,
}: VbdCarouselBottomSheetProps) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { ref, onOpen, onClose } = useBottomSheetModal({ afterClose: () => setIsOpen(false) })
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (isOpen) {
            onOpen()
        }
    }, [isOpen, onOpen])

    const handleDismiss = useCallback(() => {
        dispatch(
            setChangelogToShow({
                shouldShow: false,
                changelogKey: null,
            }),
        )
        onClose()
    }, [dispatch, onClose])

    return (
        <BaseBottomSheet
            blurBackdrop
            dynamicHeight
            backgroundStyle={{
                backgroundColor: theme.colors.actionBottomSheet.background,
            }}
            onDismiss={handleDismiss}
            enablePanDownToClose={false}
            noMargins
            floating
            ref={ref}>
            <BaseView testID="VBD_CAROUSEL_ITEM" style={styles.root}>
                <ImageBackground source={{ uri: bannerUri }} style={styles.hero}>
                    <BaseIcon
                        style={styles.closeBtn}
                        size={36}
                        name="icon-x"
                        action={() => onClose?.()}
                        testID="bottom-sheet-close-btn"
                    />
                </ImageBackground>
                <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                    <BaseView px={20} pt={16} pb={12} flexDirection="column" gap={8}>
                        <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                            <BaseView flexDirection="row" alignItems="center">
                                <FastImage source={{ uri: iconUri }} style={styles.logo as ImageStyle} />
                                <BaseSpacer width={12} flexShrink={0} />
                                <BaseText
                                    numberOfLines={1}
                                    typographyFont="subSubTitleSemiBold"
                                    color={COLORS.GREY_50}
                                    testID="VBD_CAROUSEL_ITEM_APP_NAME">
                                    {app.name}
                                </BaseText>
                            </BaseView>
                            <BaseView flexDirection="row">
                                {category && (
                                    <BaseView flexDirection="row" alignItems="center">
                                        <BaseSpacer width={24} flexShrink={0} />
                                        <CategoryChip category={category} />
                                    </BaseView>
                                )}
                            </BaseView>
                        </BaseView>
                        <BaseText
                            typographyFont="captionMedium"
                            color={COLORS.WHITE_RGBA_85}
                            flexDirection="row"
                            py={5}
                            testID="VBD_CAROUSEL_ITEM_APP_DESCRIPTION">
                            {app.description}
                        </BaseText>
                    </BaseView>
                </BlurView>
            </BaseView>
            <BaseView px={24} pt={16} pb={24}>
                <BaseButton
                    testID="Dismiss_Button"
                    my={16}
                    action={handleDismiss}
                    title={LL.BTN_DISMISS()}
                    variant="outline"
                />
            </BaseView>
        </BaseBottomSheet>
    )
}

const styles = StyleSheet.create({
    root: {
        position: "relative",
    },
    hero: {
        // ...StyleSheet.absoluteFillObject,
        position: "absolute",
        bottom: 0,
        height: 360,
        width: "100%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    blurView: {
        backgroundColor: "rgba(0, 0, 0, 0.30)",
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
})
