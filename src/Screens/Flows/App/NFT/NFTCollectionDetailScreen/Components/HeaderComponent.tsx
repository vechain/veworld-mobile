import { StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseImage,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { isEmpty } from "lodash"
import { useI18nContext } from "~i18n"
import { NonFungibleTokenCollection } from "~Model"

import { COLORS } from "~Constants"
import { useToggleCollection } from "./Hooks/useToggleCollection"
import { useTheme } from "~Hooks"
import { NFTPlaceholder } from "~Assets"
import { useMimeTypeResolver } from "~Hooks/useMimeTypeResolver"

export const HeaderComponent = memo(
    ({ collection }: { collection: NonFungibleTokenCollection }) => {
        const { LL } = useI18nContext()
        const { isImage } = useMimeTypeResolver({
            imageUrl: collection.image,
            mimeType: collection.mimeType,
        })
        const theme = useTheme()

        const { onToggleCollection, isBlacklisted } =
            useToggleCollection(collection)

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
                <BaseView flexDirection="row" alignItems="flex-end">
                    {isImage ? (
                        <BaseImage
                            uri={collection?.image}
                            style={baseStyles.nftHeaderImage}
                        />
                    ) : (
                        <BaseImage
                            uri={NFTPlaceholder}
                            style={baseStyles.nftHeaderImage}
                        />
                    )}

                    <BaseView>
                        <BaseText
                            typographyFont="subTitleBold"
                            numberOfLines={2}
                            pr={96}>
                            {collection?.name}
                        </BaseText>

                        <BaseView style={baseStyles.buttonWidth} mt={4}>
                            <BaseButton
                                haptics="Light"
                                action={onToggleCollection}
                                size="sm"
                                variant={isBlacklisted ? "solid" : "outline"}
                                radius={8}
                                title={
                                    isBlacklisted
                                        ? LL.SHOW_COLLECTION()
                                        : LL.HIDE_COLLECTION()
                                }
                                leftIcon={
                                    <BaseView mr={4}>
                                        <BaseIcon
                                            color={deriveButtonColor}
                                            name={
                                                isBlacklisted
                                                    ? "eye-outline"
                                                    : "eye-off-outline"
                                            }
                                        />
                                    </BaseView>
                                }
                            />
                        </BaseView>
                    </BaseView>
                </BaseView>

                <>
                    <BaseSpacer height={24} />

                    {!isEmpty(collection?.description) ? (
                        <>
                            <BaseText mb={12}>{LL.SB_DESCRIPTION()}</BaseText>
                            <BaseText typographyFont="bodyBold">
                                {collection.description}
                            </BaseText>
                        </>
                    ) : null}

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="biggerTitle">
                        {LL.SB_COLLECTIBLES()}
                    </BaseText>
                </>

                <BaseSpacer height={12} />
            </>
        )
    },
)

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
