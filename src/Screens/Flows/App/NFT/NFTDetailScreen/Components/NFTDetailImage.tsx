import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH, COLORS } from "~Constants"
import { BaseText, BaseView, NFTMedia } from "~Components"
import { NonFungibleToken } from "~Model"

type Props = {
    nft: NonFungibleToken
}

export const NFTDetailImage = ({ nft }: Props) => {
    const theme = useTheme()

    const renderMedia = useMemo(() => {
        return <NFTMedia uri={nft.image} styles={baseStyles.nftImage} />
    }, [nft.image])

    return (
        <BaseView>
            <BaseView style={baseStyles.nftImage}>{renderMedia}</BaseView>

            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                px={16}
                py={14}
                style={baseStyles.nftContainer}
                bg={theme.isDark ? COLORS.LIGHT_PURPLE : COLORS.DARK_PURPLE}>
                <BaseView>
                    <BaseText
                        mb={4}
                        numberOfLines={1}
                        typographyFont="subTitleBold"
                        color={COLORS.WHITE}>
                        {nft.name}
                    </BaseText>
                    <BaseText color={COLORS.WHITE}># {nft.tokenId}</BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    nftImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        width: "100%",
        height: SCREEN_WIDTH - 40,
        overflow: "hidden",
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
})
