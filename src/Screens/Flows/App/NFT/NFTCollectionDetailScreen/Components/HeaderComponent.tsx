import { StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseImage, BaseSpacer, BaseText, BaseView } from "~Components"
import { isEmpty } from "lodash"
import { useI18nContext } from "~i18n"
import { NonFungibleTokenCollection } from "~Model"

export const HeaderComponent = memo(
    ({ collection }: { collection: NonFungibleTokenCollection }) => {
        const { LL } = useI18nContext()

        return (
            <>
                <BaseView flexDirection="row" alignItems="flex-end">
                    <BaseImage
                        uri={collection?.icon ?? ""}
                        style={baseStyles.nftHeaderImage}
                    />

                    <BaseText
                        typographyFont="biggerTitle"
                        numberOfLines={2}
                        pr={24}>
                        {collection?.name}
                    </BaseText>
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
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
})
