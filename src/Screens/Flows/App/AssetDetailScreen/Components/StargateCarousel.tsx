import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseCarousel, BaseSpacer, BaseText, BaseView, CarouselSlideItem } from "~Components"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import {
    ColorThemeType,
    STARGATE_DAPP_URL,
    STARGATE_DAPP_URL_MANAGE_STAKING_BANNER,
    STARGATE_DAPP_URL_NEW_STAKING_BANNER,
} from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
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
    const nav = useNavigation()

    const { navigateWithTab } = useBrowserTab()

    const cards = useMemo(() => {
        return ownedStargateNfts
            .map(
                (nft, idx) =>
                    ({
                        content: <StargateCarouselItem item={nft} />,
                        closable: false,
                        isExternalLink: false,
                        name: nft.tokenId,
                        style: idx === 0 ? styles.biggerCarouselItem : styles.carouselItem,
                        href: `${STARGATE_DAPP_URL}/nft/${nft.tokenId}`,
                    } as CarouselSlideItem),
            )
            .concat([
                {
                    content: <NewStargateStakeCarouselItem />,
                    closable: false,
                    isExternalLink: false,
                    name: "NEW_STAKE",
                    style: styles.biggerCarouselItem,
                    href: STARGATE_DAPP_URL_NEW_STAKING_BANNER,
                } satisfies CarouselSlideItem,
            ])
    }, [ownedStargateNfts, styles.biggerCarouselItem, styles.carouselItem])

    const onNavigateToStargate = useCallback(() => {
        navigateWithTab({
            url: STARGATE_DAPP_URL_MANAGE_STAKING_BANNER,
            title: "Stargate App",
            navigationFn(u) {
                nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    if (!isLoadingNfts && !isLoadingNodes && stargateNodes.length === 0)
        return <BannersCarousel location="token_screen" />

    return (
        <BaseView flexDirection="column" gap={12} w={100} mb={40}>
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
                    data={cards}
                    contentWrapperStyle={styles.padding}
                    w={240}
                    paginationAlignment="flex-start"
                    padding={24}
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
        biggerCarouselItem: {
            width: 264,
        },
        padding: {
            paddingStart: 0,
        },
        button: {
            marginHorizontal: 24,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
        },
    })
