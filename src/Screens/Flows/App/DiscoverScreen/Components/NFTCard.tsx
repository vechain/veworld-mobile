import { ExpandedNFT } from "~Hooks/useNftDiscovery/useNftDiscovery"
import React, { useCallback, useMemo } from "react"
import { BaseImage, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useBrowserSearch, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"

export const NFTCard: React.FC<{
    nft: ExpandedNFT
    setFilteredSearch: (val: string | undefined) => void
}> = ({ nft, setFilteredSearch }) => {
    const { styles } = useThemedStyles(baseStyles)
    const { navigateToBrowser } = useBrowserSearch()

    const description = useMemo(() => {
        if (nft.description.trim() !== "") return nft.description

        return nft.marketplaceLink
    }, [nft])

    const navigateToNft = useCallback(() => {
        navigateToBrowser(nft.marketplaceLink ?? nft.name)
        setFilteredSearch(undefined)
    }, [nft, setFilteredSearch, navigateToBrowser])

    return (
        <BaseView w={100} flexDirection="row">
            <BaseTouchableBox
                haptics="Light"
                action={navigateToNft}
                justifyContent="space-between"
                containerStyle={styles.container}>
                <BaseView flexDirection="row" style={styles.card} flex={1} pr={10}>
                    <BaseImage uri={nft.imageUrl} style={styles.image} />

                    <BaseSpacer width={12} />
                    <BaseView flex={1}>
                        <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.nameText}>
                            {nft.name}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText ellipsizeMode="tail" numberOfLines={2} style={styles.description}>
                            {description}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseTouchableBox>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
            height: 60,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
            color: "gray",
        },
        image: {
            height: 40,
            width: 40,
        },
    })
