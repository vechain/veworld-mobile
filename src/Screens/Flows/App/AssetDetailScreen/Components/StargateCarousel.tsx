import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import { BaseButton, BaseCarousel, BaseSpacer, BaseText, BaseView, CarouselSlideItem } from "~Components"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import { ColorThemeType, STARGATE_DAPP_URL } from "~Constants"
import { useThemedStyles, useUserNodes, useUserStargateNfts } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { BannersCarousel } from "../../HomeScreen/Components"
import { NewStargateStakeCarouselItem } from "./NewStargateStakeCarouselItem"
import { StargateCarouselItem } from "./StargateCarouselItem"

export const StargateCarousel = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const address = useAppSelector(selectSelectedAccountAddress)

    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(address)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts(stargateNodes, isLoadingNodes)
    const [width, setWidth] = useState(300)
    const nav = useNavigation()

    const { navigateWithTab } = useBrowserTab()

    const cards = useMemo(() => {
        return ownedStargateNfts
            .map(
                nft =>
                    ({
                        content: <StargateCarouselItem item={nft} />,
                        closable: false,
                        isExternalLink: false,
                        name: nft.tokenId,
                        style: styles.carouselItem,
                        href: `${STARGATE_DAPP_URL}/nft/${nft.tokenId}`,
                    } as CarouselSlideItem),
            )
            .concat([
                {
                    content: <NewStargateStakeCarouselItem />,
                    closable: false,
                    isExternalLink: false,
                    name: "NEW_STAKE",
                    style: styles.carouselItem,
                } satisfies CarouselSlideItem,
            ])
    }, [ownedStargateNfts, styles.carouselItem])

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        setWidth(e.nativeEvent.layout.width)
    }, [])

    const onNavigateToStargate = useCallback(() => {
        navigateWithTab({
            url: STARGATE_DAPP_URL,
            title: "Stargate App",
            navigationFn(u) {
                nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    if (!isLoadingNfts && !isLoadingNodes && stargateNodes.length === 0)
        return <BannersCarousel location="token_screen" />

    return (
        <BaseView flexDirection="column" gap={12} w={100} mb={40} onLayout={onLayout}>
            <BaseText py={10} typographyFont="bodySemiBold">
                {LL.ACTIVITY_STAKING_LABEL()}
            </BaseText>
            <BaseView style={styles.card}>
                <StargateLockedValue
                    isLoading={isLoadingNodes || isLoadingNfts}
                    nfts={ownedStargateNfts}
                    rootStyle={styles.section}
                />
                <BaseSpacer bg={theme.colors.cardDivider} height={1} />
                <BaseCarousel
                    showPagination
                    autoPlay={false}
                    loop={false}
                    data={cards}
                    h={324}
                    paginationAlignment="flex-start"
                    w={240}
                    contentWrapperStyle={styles.padding}
                    paginationStyle={styles.padding}
                    mode="normal"
                    containerWidth={width}
                    gap={8}
                />
                <BaseSpacer bg={theme.colors.cardDivider} height={1} />
                <BaseButton
                    variant="solid"
                    action={onNavigateToStargate}
                    style={styles.button}
                    py={8}
                    textColor={theme.colors.actionBanner.buttonTextSecondary}
                    bgColor={theme.colors.actionBanner.buttonBackground}>
                    {LL.STARGATE_MANAGE_STAKING()}
                </BaseButton>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        section: {
            paddingHorizontal: 24,
        },
        card: {
            backgroundColor: theme.colors.stakedVetCard.background,
            paddingVertical: 16,
            flexDirection: "column",
            borderRadius: 12,
            gap: 16,
            width: "100%",
        },
        carouselItem: {
            width: 240,
        },
        padding: {
            paddingStart: 24,
        },
        button: {
            marginHorizontal: 24,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
        },
    })
