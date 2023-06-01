import React from "react"
import { StyleSheet } from "react-native"
import { SCREEN_WIDTH, useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
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
            <BaseImage
                uri={image}
                w={IMAGE_SIZE}
                h={IMAGE_SIZE}
                style={baseStyles.nftImage}
            />

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

                <BaseText color={COLORS.WHITE}>TEST</BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    nftImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
})
