import React from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH, COLORS } from "~Constants"
import { BaseImage, BaseText, BaseView } from "~Components"

type Props = {
    image: string
    name: string
    tokenId: string
}

const IMAGE_SIZE = SCREEN_WIDTH - 40

export const NFTDetailImage = ({ image, name, tokenId }: Props) => {
    const theme = useTheme()

    return (
        <BaseView>
            <BaseView style={baseStyles.nftImage}>
                <BaseImage
                    uri={image}
                    w={IMAGE_SIZE}
                    h={IMAGE_SIZE}
                    style={baseStyles.nftImage}
                />
            </BaseView>

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
                        typographyFont="subTitleBold"
                        color={COLORS.WHITE}>
                        {name}
                    </BaseText>
                    <BaseText color={COLORS.WHITE}># {tokenId}</BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    nftImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
})
