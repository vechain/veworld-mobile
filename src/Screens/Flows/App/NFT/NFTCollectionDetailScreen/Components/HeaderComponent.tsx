import { StyleSheet } from "react-native"
import React, { memo } from "react"
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

export const HeaderComponent = memo(
    ({ collection }: { collection: NonFungibleTokenCollection }) => {
        const { LL } = useI18nContext()

        const { onToggleCollection, toggleCollectionUI } =
            useToggleCollection(collection)

        return (
            <>
                <BaseView flexDirection="row" alignItems="flex-end">
                    <BaseImage
                        uri={collection?.icon ?? ""}
                        style={baseStyles.nftHeaderImage}
                    />

                    <BaseView>
                        <BaseText
                            typographyFont="subTitleBold"
                            numberOfLines={2}
                            pr={96}>
                            {collection?.name}
                        </BaseText>

                        <BaseView style={baseStyles.buttonWidth} mt={4}>
                            <BaseButton
                                action={onToggleCollection}
                                size="sm"
                                variant={
                                    toggleCollectionUI ? "solid" : "outline"
                                }
                                radius={8}
                                title={
                                    toggleCollectionUI
                                        ? "Show Collection"
                                        : "Hide Collection"
                                }
                                leftIcon={
                                    <BaseView mr={4}>
                                        <BaseIcon
                                            color={
                                                toggleCollectionUI
                                                    ? COLORS.WHITE
                                                    : COLORS.DARK_PURPLE
                                            }
                                            name={
                                                toggleCollectionUI
                                                    ? "eye"
                                                    : "eye-off"
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
                    <BaseText mb={12}>{LL.SB_DESCRIPTION()}</BaseText>
                    <BaseText typographyFont="bodyBold">
                        {!isEmpty(collection?.description)
                            ? collection?.description
                            : LL.BD_NFT_DESC_PLACEHOLDER()}
                    </BaseText>
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
