import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCarousel, BaseSpacer, BaseText, BaseView, CarouselSlideItem } from "~Components"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import { ColorThemeType } from "~Constants"
import { useThemedStyles, useUserNodes, useUserStargateNfts } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { StargateCarouselItem } from "./StargateCarouselItem"

export const StargateCarousel = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const address = useAppSelector(selectSelectedAccountAddress)

    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(address)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts(stargateNodes, isLoadingNodes)

    const cards = useMemo(() => {
        return ownedStargateNfts.map(
            nft =>
                ({
                    content: <StargateCarouselItem item={nft} />,
                    closable: false,
                    isExternalLink: false,
                    name: nft.tokenId,
                    style: styles.carouselItem,
                } satisfies CarouselSlideItem),
        )
    }, [ownedStargateNfts, styles.carouselItem])

    if (!isLoadingNfts && !isLoadingNodes && stargateNodes.length === 0) return null

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
                <BaseCarousel showPagination autoPlay={false} loop={false} data={cards} h={316} />
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
    })
