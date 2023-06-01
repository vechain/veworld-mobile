import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { SCREEN_WIDTH, useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseIcon, BaseImage, BaseText, BaseView, BlurView } from "~Components"
import { setNFTIsHidden, useAppDispatch } from "~Storage/Redux"

type Props = {
    image: string
    name: string
    tokenId: string
    hidden: boolean
    collectionAddress: string
}

const IMAGE_SIZE = SCREEN_WIDTH - 40

export const NFTDetailImage = ({
    image,
    name,
    tokenId,
    hidden,
    collectionAddress,
}: Props) => {
    const theme = useTheme()
    const dispatch = useAppDispatch()

    const onHiddenPress = useCallback(() => {
        dispatch(
            setNFTIsHidden({
                contractAddress: collectionAddress,
                tokenId,
                isHidden: !hidden,
            }),
        )
    }, [collectionAddress, dispatch, hidden, tokenId])

    return (
        <BaseView>
            <BaseView style={baseStyles.nftImage}>
                <BaseImage
                    uri={image}
                    w={IMAGE_SIZE}
                    h={IMAGE_SIZE}
                    style={baseStyles.nftImage}
                />

                {hidden && <BlurView blurAmount={30} />}
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

                <BaseIcon
                    name={hidden ? "eye-off-outline" : "eye-outline"}
                    bg={COLORS.LIME_GREEN}
                    color={COLORS.DARK_PURPLE}
                    action={onHiddenPress}
                    size={24}
                />
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
