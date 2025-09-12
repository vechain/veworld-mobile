import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseCarousel, BaseChip, BaseSpacer, BaseText, BaseView, CarouselSlideItem } from "~Components"
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
import { AddressUtils } from "~Utils"
import { BannersCarousel } from "../../HomeScreen/Components"
import { NewStargateStakeCarouselItem } from "./NewStargateStakeCarouselItem"
import { StargateCarouselItem } from "./StargateCarouselItem"

enum StakingFilter {
    OWN = "own",
    MANAGING = "managing",
}

export const StargateCarousel = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const address = useAppSelector(selectSelectedAccountAddress)

    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(address)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts({
        nodes: stargateNodes,
        isLoadingNodes,
    })
    const nav = useNavigation()

    const { navigateWithTab } = useBrowserTab()

    const hasOwnedNodes = useMemo(
        () => stargateNodes.some(node => AddressUtils.compareAddresses(node.xNodeOwner, address)),
        [stargateNodes, address],
    )
    const hasManagedNodes = useMemo(
        () => stargateNodes.some(node => !AddressUtils.compareAddresses(node.xNodeOwner, address)),
        [stargateNodes, address],
    )

    // Initialize filter state
    const [filter, setFilter] = useState<StakingFilter>(StakingFilter.OWN)

    useEffect(() => {
        if (isLoadingNodes || !stargateNodes.length) return

        const preferredFilter = hasOwnedNodes ? StakingFilter.OWN : StakingFilter.MANAGING
        setFilter(currentFilter => {
            return currentFilter !== preferredFilter ? preferredFilter : currentFilter
        })
    }, [hasOwnedNodes, isLoadingNodes, stargateNodes.length])

    const filteredNodes = useMemo(() => {
        return filter === StakingFilter.OWN
            ? stargateNodes.filter(node => AddressUtils.compareAddresses(node.xNodeOwner, address))
            : stargateNodes.filter(node => !AddressUtils.compareAddresses(node.xNodeOwner, address))
    }, [stargateNodes, filter, address])

    const filteredNfts = useMemo(() => {
        const nodeIds = new Set(filteredNodes.map(n => n.nodeId))
        return ownedStargateNfts.filter(nft => nodeIds.has(nft.tokenId))
    }, [ownedStargateNfts, filteredNodes])

    const cards = useMemo(() => {
        return filteredNfts
            .map(
                (nft, idx) =>
                    ({
                        content: <StargateCarouselItem item={nft} />,
                        closable: false,
                        isExternalLink: false,
                        name: nft.tokenId,
                        style: idx === 0 ? styles.biggerCarouselItem : styles.carouselItem,
                        href: `${STARGATE_DAPP_URL}/nft/${nft.tokenId}`,
                        testID: `STARGATE_CAROUSEL_ITEM_${nft.tokenId}`,
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
                    testID: "STARGATE_CAROUSEL_NEW_STAKE",
                } satisfies CarouselSlideItem,
            ])
    }, [filteredNfts, styles.biggerCarouselItem, styles.carouselItem])

    const onNavigateToStargate = useCallback(() => {
        navigateWithTab({
            url: STARGATE_DAPP_URL_MANAGE_STAKING_BANNER,
            title: "Stargate App",
            navigationFn(u) {
                nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    const filterButtons = useMemo(
        () => [
            { id: StakingFilter.OWN, label: LL.STARGATE_OWN_LABEL() },
            { id: StakingFilter.MANAGING, label: LL.STARGATE_DELEGATEE_LABEL() },
        ],
        [LL],
    )

    if (!isLoadingNfts && !isLoadingNodes && stargateNodes.length === 0)
        return <BannersCarousel location="token_screen" />

    return (
        <BaseView flexDirection="column" gap={12} w={100} mb={40}>
            <BaseView flexDirection="row" alignItems="center" justifyContent="space-between" py={8}>
                <BaseText typographyFont="bodySemiBold">{LL.ACTIVITY_STAKING_LABEL()}</BaseText>
                {hasOwnedNodes && hasManagedNodes && (
                    <BaseView flexDirection="row" gap={12}>
                        {filterButtons.map(button => (
                            <BaseChip
                                key={button.id}
                                label={button.label}
                                active={filter === button.id}
                                onPress={() => setFilter(button.id)}
                            />
                        ))}
                    </BaseView>
                )}
            </BaseView>
            <BaseView style={styles.card}>
                <StargateLockedValue
                    isLoading={isLoadingNodes || isLoadingNfts}
                    nfts={filteredNfts}
                    rootStyle={styles.section}
                    isNodeOwner={filter === StakingFilter.OWN && hasOwnedNodes}
                />
                <BaseSpacer bg={theme.colors.cardDivider} height={1} />
                <BaseCarousel
                    data={cards}
                    contentWrapperStyle={styles.padding}
                    w={240}
                    paginationAlignment="flex-start"
                    padding={16}
                />
                <BaseSpacer bg={theme.colors.cardDivider} height={1} />
                <BaseButton
                    variant="solid"
                    action={onNavigateToStargate}
                    style={styles.button}
                    py={8}
                    textColor={theme.colors.actionBanner.buttonTextSecondary}
                    bgColor={theme.colors.actionBanner.buttonBackground}
                    typographyFont="bodySemiBold">
                    {LL.STARGATE_MANAGE_STAKING()}
                </BaseButton>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        section: {
            paddingHorizontal: 16,
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
            width: 256,
        },
        padding: {
            paddingStart: 0,
        },
        button: {
            marginHorizontal: 16,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
        },
    })
