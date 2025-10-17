import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, DiscoveryDApp } from "~Constants"
import { useBrowserNavigation, useCameraBottomSheet, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DAppCardV2 } from "~Screens/Flows/App/AppsScreen/Components/Favourites/DAppCardV2"
import { useVerifiedNFTApps } from "../../Hooks/useVerifiedNFTApps"

export const CollectiblesEmptyCard = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const verifiedNFTApps = useVerifiedNFTApps()
    const { navigateToBrowser } = useBrowserNavigation()
    const { handleOpenOnlyReceiveCamera, RenderCameraModal } = useCameraBottomSheet({ targets: [] })

    const renderItem = useCallback(
        ({ item }: { item: DiscoveryDApp }) => {
            return (
                <DAppCardV2
                    dapp={item}
                    showDappTitle
                    iconSize={72}
                    typographyFont="captionMedium"
                    onPress={() => {
                        navigateToBrowser(item.href)
                    }}
                />
            )
        },
        [navigateToBrowser],
    )

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer width={16} />
    }, [])

    return (
        <>
            <BaseView style={styles.root} testID="COLLECTIBLES_EMPTY_CARD">
                <BaseView px={24} pb={24} flexDirection="column" gap={24} alignItems="center">
                    <BaseView
                        borderRadius={32}
                        bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_100}
                        p={16}
                        flex={0}
                        alignItems="center"
                        justifyContent="center">
                        <BaseIcon
                            name="icon-image"
                            size={32}
                            color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_400}
                        />
                    </BaseView>
                    <BaseText
                        color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}
                        typographyFont="body"
                        align="center">
                        {LL.COLLECTIBLES_EMPTY_CARD_DESCRIPTION()}
                    </BaseText>
                    <BaseButton
                        action={handleOpenOnlyReceiveCamera}
                        variant="solid"
                        rightIcon={
                            <BaseIcon
                                name="icon-arrow-down"
                                color={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
                                size={20}
                            />
                        }
                        typographyFont="bodySemiBold"
                        w={100}
                        style={styles.button}
                        textColor={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
                        bgColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                        selfAlign="center">
                        {LL.COMMON_RECEIVE()}
                    </BaseButton>
                </BaseView>

                <BaseSpacer height={1} background={theme.isDark ? COLORS.PURPLE_DISABLED : theme.colors.background} />

                <BaseView py={24} gap={24} justifyContent="center" alignItems="flex-start">
                    <BaseView alignSelf="center" flexDirection="row" justifyContent="center" px={24}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}
                            typographyFont="captionMedium"
                            align="center">
                            {LL.COLLECTIBLES_EMPTY_CARD_MARKETPLACE_CAPTION()}
                        </BaseText>
                    </BaseView>
                    <FlatList
                        data={verifiedNFTApps}
                        keyExtractor={item => item.name}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        contentContainerStyle={styles.flatListContentContainer}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </BaseView>
            </BaseView>
            {RenderCameraModal}
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            paddingTop: 32,
            position: "relative",
            flexDirection: "column",
            borderRadius: 16,
        },
        actionsText: {
            fontWeight: 600,
            fontSize: 40,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        button: {
            justifyContent: "center",
            gap: 12,
        },
        flatListContentContainer: {
            paddingHorizontal: 24,
        },
    })
