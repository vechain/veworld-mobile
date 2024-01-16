import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH, COLORS } from "~Constants"
import { BaseIcon, BaseText, BaseView, NFTMedia, PlatformBlur } from "~Components"
import { NonFungibleToken } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    nft: NonFungibleToken
    isBlacklisted: boolean
}

export const NFTDetailImage = ({ nft, isBlacklisted }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const renderMedia = useMemo(() => {
        return (
            <NFTMedia
                uri={nft.image}
                nftName={nft.name}
                styles={baseStyles.nftImage}
                isUseLongPress
                isPlayAudio
                useNativeControls
            />
        )
    }, [nft.image, nft.name])

    const [removeBlur, setRemoveBlur] = useState(false)
    const onRemoveBlurMomentarily = useCallback(() => {
        if (!isBlacklisted) return

        setRemoveBlur(prevState => !prevState)
    }, [isBlacklisted])

    return (
        <BaseView>
            <BaseView style={baseStyles.nftImage}>
                {renderMedia}
                {isBlacklisted && !removeBlur ? (
                    <PlatformBlur blurAmount={10} text={LL.SHOW_NFT()} backgroundColor={theme.colors.card} />
                ) : null}
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
                    <BaseText mb={4} numberOfLines={1} typographyFont="subTitleBold" color={COLORS.WHITE}>
                        {nft.name}
                    </BaseText>
                    <BaseText color={COLORS.WHITE}># {nft.tokenId}</BaseText>
                </BaseView>

                {isBlacklisted ? (
                    <BaseIcon
                        name={!removeBlur ? "eye-outline" : "eye-off-outline"}
                        size={32}
                        color={"white"}
                        action={onRemoveBlurMomentarily}
                    />
                ) : null}
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
