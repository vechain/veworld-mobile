import { StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, NFTMedia } from "~Components"
import { isEmpty } from "lodash"
import { useI18nContext } from "~i18n"
import { NFTMediaType, NftCollection } from "~Model"

import { COLORS } from "~Constants"
import { useToggleCollection } from "./Hooks/useToggleCollection"
import { useTheme } from "~Hooks"

export const HeaderComponent = memo(({ collection }: { collection: NftCollection }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { onToggleCollection, isBlacklisted } = useToggleCollection(collection)

    const deriveButtonColor = useMemo(() => {
        if (!theme.isDark) {
            if (isBlacklisted) return COLORS.WHITE
            return COLORS.DARK_PURPLE
        }

        if (isBlacklisted) return COLORS.DARK_PURPLE
        return COLORS.WHITE
    }, [isBlacklisted, theme])

    return (
        <>
            <BaseView flexDirection="row" alignItems="flex-end" mx={20} mt={20}>
                {collection.mediaType === NFTMediaType.IMAGE && (
                    <NFTMedia uri={collection.image} styles={baseStyles.nftHeaderImage} />
                )}

                <BaseView>
                    <BaseText typographyFont="subTitleBold" numberOfLines={2} pr={96}>
                        {collection.name}
                    </BaseText>

                    <BaseView style={baseStyles.buttonWidth} mt={4}>
                        <BaseButton
                            haptics="Light"
                            action={onToggleCollection}
                            size="sm"
                            variant={isBlacklisted ? "solid" : "outline"}
                            radius={8}
                            title={isBlacklisted ? LL.SHOW_COLLECTION() : LL.HIDE_COLLECTION()}
                            leftIcon={
                                <BaseView mr={4}>
                                    <BaseIcon
                                        color={deriveButtonColor}
                                        name={isBlacklisted ? "icon-eye" : "icon-eye-off"}
                                    />
                                </BaseView>
                            }
                        />
                    </BaseView>
                </BaseView>
            </BaseView>

            <BaseView mx={20}>
                <BaseSpacer height={24} />

                {!isEmpty(collection.description) && (
                    <>
                        <BaseText mb={12}>{LL.SB_DESCRIPTION()}</BaseText>
                        <BaseText typographyFont="bodyBold">{collection.description}</BaseText>
                    </>
                )}

                <BaseSpacer height={24} />
                <BaseText typographyFont="biggerTitle">{LL.SB_COLLECTIBLES()}</BaseText>
            </BaseView>

            <BaseSpacer height={12} />
        </>
    )
})

const baseStyles = StyleSheet.create({
    nftHeaderImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 12,
    },
    buttonWidth: {
        width: 134,
        height: 32,
    },
})
