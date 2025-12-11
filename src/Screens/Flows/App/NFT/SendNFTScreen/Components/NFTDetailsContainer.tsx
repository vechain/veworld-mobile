import React, { PropsWithChildren, useMemo } from "react"
import { BaseText, BaseView } from "~Components"
import { AccountIcon } from "~Components/Reusable/Account/AccountIcon"
import { COLORS } from "~Constants"
import { useTheme, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { AddressUtils } from "~Utils"

const PADDING = 16

const NFTDetailsContainer = ({ children }: PropsWithChildren) => {
    return <BaseView gap={8}>{children}</BaseView>
}

const NFTInfo = ({
    nftImage,
    collectionName,
    tokenId,
    isLoading,
}: {
    nftImage: React.ReactNode
    collectionName: string
    tokenId: string
    isLoading: boolean
}) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <BaseView
            flexDirection="row"
            py={PADDING}
            px={PADDING}
            borderRadius={16}
            bg={theme.colors.sendScreen.summaryScreen.background}>
            <BaseView pr={16}>{nftImage}</BaseView>
            {!isLoading && (
                <BaseView flexDirection="column" flex={1} justifyContent="center" gap={16}>
                    <BaseView gap={4}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={theme.colors.sendScreen.summaryScreen.caption}>
                            {LL.COMMON_LBL_NAME()}
                        </BaseText>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.sendScreen.summaryScreen.address}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {collectionName}
                        </BaseText>
                    </BaseView>
                    <BaseView gap={4}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={theme.colors.sendScreen.summaryScreen.caption}>
                            {LL.COMMON_LBL_ID()}
                        </BaseText>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.sendScreen.summaryScreen.address}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            #{tokenId}
                        </BaseText>
                    </BaseView>
                </BaseView>
            )}
        </BaseView>
    )
}

const Receiver = ({ address, testID }: { address: string; testID?: string }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const vns = useVns({
        name: "",
        address: address,
    })

    const displayAddress = useMemo(() => {
        return AddressUtils.showAddressOrName(address, vns, {
            ellipsed: true,
            lengthBefore: 4,
            lengthAfter: 6,
        })
    }, [address, vns])

    return (
        <BaseView
            flexDirection="column"
            justifyContent="space-between"
            bg={theme.colors.sendScreen.summaryScreen.background}
            gap={8}
            borderRadius={16}
            pt={12}
            pb={16}
            px={PADDING}
            testID={testID}>
            <BaseText typographyFont="captionSemiBold" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} py={4}>
                {LL.ADDITIONAL_DETAIL_RECEIVER()}
            </BaseText>
            <BaseView flexDirection="row" gap={12}>
                <AccountIcon account={{ address, type: DEVICE_TYPE.LOCAL_MNEMONIC }} size={24} />
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                    {displayAddress}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

NFTDetailsContainer.NFTInfo = NFTInfo
NFTDetailsContainer.Receiver = Receiver

export { NFTDetailsContainer }
