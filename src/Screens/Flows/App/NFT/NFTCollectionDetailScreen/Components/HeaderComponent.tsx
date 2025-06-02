import { isEmpty } from "lodash"
import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, NFTMedia } from "~Components"
import { useI18nContext } from "~i18n"
import { NFTMediaType, NftCollection } from "~Model"

import { ColorThemeType } from "~Constants"
import { useBottomSheetModal, useTheme, useThemedStyles } from "~Hooks"
import { useToggleCollection } from "./Hooks/useToggleCollection"
import { NFTReportCollectionBottomsheet } from "~Screens/Flows/App/NFT/NFTReportCollection"

export const HeaderComponent = memo(({ collection }: { collection: NftCollection }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)

    const {
        ref: reportCollectionRef,
        onOpen: onOpenReportCollection,
        onClose: onCloseReportCollection,
    } = useBottomSheetModal()

    const { onToggleCollection, isBlacklisted } = useToggleCollection(collection)

    const handleOpenReportCollection = useCallback(() => {
        onOpenReportCollection()
    }, [onOpenReportCollection])

    return (
        <>
            <BaseView flexDirection="row" alignItems="flex-end" mx={20} mt={20}>
                {collection.mediaType === NFTMediaType.IMAGE && (
                    <NFTMedia uri={collection.image} styles={styles.nftHeaderImage} />
                )}

                <BaseView gap={16}>
                    <BaseText typographyFont="subTitleBold" numberOfLines={2} pr={96}>
                        {collection.name}
                    </BaseText>

                    <BaseView gap={12} flexDirection="row" alignSelf="flex-start">
                        <BaseButton
                            haptics="Light"
                            action={onToggleCollection}
                            size="sm"
                            style={styles.buttons}
                            textColor={theme.colors.label.text}
                            title={isBlacklisted ? LL.COMMON_SHOW() : LL.COMMON_HIDE()}
                            leftIcon={
                                <BaseView mr={8}>
                                    <BaseIcon
                                        size={16}
                                        color={theme.colors.label.text}
                                        name={isBlacklisted ? "icon-eye" : "icon-eye-off"}
                                    />
                                </BaseView>
                            }
                        />
                        <BaseButton
                            haptics="Light"
                            action={handleOpenReportCollection}
                            size="sm"
                            style={styles.buttons}
                            textColor={theme.colors.label.text}
                            title={LL.COMMON_REPORT()}
                            leftIcon={
                                <BaseView mr={8}>
                                    <BaseIcon size={16} color={theme.colors.label.text} name={"icon-alert-triangle"} />
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

            <NFTReportCollectionBottomsheet
                ref={reportCollectionRef}
                onClose={onCloseReportCollection}
                nftAddress={collection.address}
            />
        </>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        nftHeaderImage: {
            width: 80,
            height: 80,
            borderRadius: 12,
            marginRight: 12,
        },
        buttons: {
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.colors.label.background,
        },
    })
