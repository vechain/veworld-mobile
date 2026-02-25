import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseCarousel, BaseSpacer, BaseView, CarouselSlideItem } from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import {
    COLORS,
    ColorThemeType,
    STARGATE_DAPP_URL,
    STARGATE_DAPP_URL_MANAGE_STAKING_BANNER,
    STARGATE_DAPP_URL_NEW_STAKING_BANNER,
} from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useUserNodes } from "~Hooks/Staking"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useOfflineCallback } from "~Hooks/useOfflineCallback"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { AddressUtils, sortNodesByDelegationStatus } from "~Utils"
import { NewStargateStakeCarouselItem } from "./NewStargateStakeCarouselItem"
import { StargateCarouselItem } from "./StargateCarouselItem"
import { StargateNoStakingCard } from "./StargateNoStakingCard"

enum StakingFilter {
    OWN = "own",
    MANAGING = "managing",
}

export const StargateCarousel = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const address = useAppSelector(selectSelectedAccountAddress)

    const { data, isLoading: isLoadingNodes } = useUserNodes(address)

    const nav = useNavigation()

    const { navigateWithTab } = useBrowserTab()

    const hasOwnedNodes = useMemo(
        () => data.some(node => AddressUtils.compareAddresses(node.xNodeOwner, address)),
        [data, address],
    )
    const hasManagedNodes = useMemo(
        () => data.some(node => !AddressUtils.compareAddresses(node.xNodeOwner, address)),
        [data, address],
    )

    // Initialize filter state
    const [filter, setFilter] = useState<StakingFilter>(StakingFilter.OWN)

    useEffect(() => {
        if (isLoadingNodes || !data.length) return

        const preferredFilter = hasOwnedNodes ? StakingFilter.OWN : StakingFilter.MANAGING
        setFilter(currentFilter => {
            return currentFilter !== preferredFilter ? preferredFilter : currentFilter
        })
    }, [hasOwnedNodes, isLoadingNodes, data.length])

    const filteredNodes = useMemo(() => {
        const filtered =
            filter === StakingFilter.OWN
                ? data.filter(node => AddressUtils.compareAddresses(node.xNodeOwner, address))
                : data.filter(node => !AddressUtils.compareAddresses(node.xNodeOwner, address))

        return sortNodesByDelegationStatus(filtered)
    }, [data, filter, address])

    const cards = useMemo(() => {
        return filteredNodes
            .map(
                (nft, idx) =>
                    ({
                        content: <StargateCarouselItem item={nft} />,
                        closable: false,
                        isExternalLink: false,
                        name: nft.nodeId,
                        style: idx === 0 ? styles.biggerCarouselItem : styles.carouselItem,
                        href: `${STARGATE_DAPP_URL}/nft/${nft.nodeId}`,
                        testID: `STARGATE_CAROUSEL_ITEM_${nft.nodeId}`,
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
    }, [filteredNodes, styles.biggerCarouselItem, styles.carouselItem])

    const _onNavigateToStargate = useCallback(() => {
        navigateWithTab({
            url: STARGATE_DAPP_URL_MANAGE_STAKING_BANNER,
            title: "Stargate App",
            navigationFn(u) {
                nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    const onNavigateToStargate = useOfflineCallback(_onNavigateToStargate)

    const filterButtons = useMemo(
        () => [
            { id: StakingFilter.OWN, label: LL.STARGATE_OWN_LABEL() },
            { id: StakingFilter.MANAGING, label: LL.STARGATE_DELEGATEE_LABEL() },
        ],
        [LL],
    )

    const indicatorBackgroundColor = useMemo(() => (theme.isDark ? COLORS.PURPLE : COLORS.GREY_100), [theme.isDark])
    const containerBackgroundColor = useMemo(
        () => (theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE),
        [theme.isDark],
    )

    if (!isLoadingNodes && data.length === 0)
        return (
            <BaseView px={24}>
                <StargateNoStakingCard />
            </BaseView>
        )

    return (
        <BaseView px={24} flexDirection="column" gap={12} w={100}>
            <BaseView style={styles.card}>
                {hasOwnedNodes && hasManagedNodes && (
                    <BaseView px={16}>
                        <BaseTabs
                            keys={filterButtons.map(button => button.id)}
                            labels={filterButtons.map(button => button.label)}
                            selectedKey={filter}
                            setSelectedKey={setFilter}
                            showBorder={false}
                            indicatorBackgroundColor={indicatorBackgroundColor}
                            containerBackgroundColor={containerBackgroundColor}
                        />
                    </BaseView>
                )}
                <StargateLockedValue
                    isLoading={isLoadingNodes}
                    nfts={filteredNodes}
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
                    typographyFont="captionSemiBold">
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
