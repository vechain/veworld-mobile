import React from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { BaseCard, BaseIcon, BaseImage, BaseText, BaseView, FiatBalance } from "~Components"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Token } from "~Model"
import { selectOfficialTokens, selectVisibleCustomTokens, useAppSelector } from "~Storage/Redux"
import { SWAP_SIDE } from "../SwapCard"

type Props = {
    provenance: SWAP_SIDE
    addressShort: string
    addressFull: string
    amount: string
    onAddCustomToken: (token: string) => void
    fiatValue?: string
    token?: Token
}

export const TokenBox = ({
    provenance,
    addressShort,
    addressFull,
    amount,
    onAddCustomToken,
    fiatValue,
    token,
}: Props) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    const provenanceText = provenance === SWAP_SIDE.PAID ? LL.PAID() : LL.RECEIVED()

    const customTokens = useAppSelector(selectVisibleCustomTokens)

    const officialTokens = useAppSelector(selectOfficialTokens)

    const isTokenAdded = [...customTokens, ...officialTokens]
        .map(tkn => tkn.address.toLowerCase())
        .includes(addressFull.toLowerCase())

    const tokenIcon = (
        <DropShadow style={[theme.shadows.card]}>
            <BaseView flexDirection="column" alignItems="center">
                {token?.icon ? (
                    <BaseCard
                        style={[baseStyles.imageContainer, { backgroundColor: COLORS.WHITE }]}
                        containerStyle={baseStyles.imageShadow}>
                        <BaseImage source={{ uri: token.icon }} style={baseStyles.tokenIcon} />
                    </BaseCard>
                ) : (
                    <BaseIcon
                        name="icon-help-circle"
                        size={22}
                        color={COLORS.DARK_PURPLE}
                        bg={COLORS.WHITE}
                        iconPadding={4}
                    />
                )}
            </BaseView>
        </DropShadow>
    )

    return (
        <BaseView py={12} px={16} style={{ width: SCREEN_WIDTH - 40 }} alignItems="flex-start">
            <BaseText typographyFont="buttonPrimary">{provenanceText}</BaseText>
            <BaseView flexDirection="row" py={8}>
                {tokenIcon}
                <BaseView flexDirection="column" pl={12}>
                    {token ? (
                        <>
                            <BaseView flexDirection="row">
                                <BaseText typographyFont="subSubTitle">{token.name}</BaseText>
                                <BaseText typographyFont="subSubTitleLight">
                                    {" ("}
                                    {token.symbol}
                                    {")"}
                                </BaseText>
                            </BaseView>
                            <BaseView pt={3} flexDirection="row">
                                <BaseText typographyFont="captionBold">{amount}</BaseText>
                                <BaseText typographyFont="captionBold"> {token.symbol}</BaseText>
                                {fiatValue && (
                                    <FiatBalance typographyFont="captionRegular" balances={[fiatValue]} prefix=" ≈ " />
                                )}
                            </BaseView>
                        </>
                    ) : (
                        <BaseText typographyFont="button">{addressShort}</BaseText>
                    )}
                </BaseView>
                {!isTokenAdded && (
                    <BaseView pl={12}>
                        <BaseIcon
                            name="icon-plus"
                            size={20}
                            bg={COLORS.LIME_GREEN}
                            iconPadding={3}
                            color={COLORS.DARK_PURPLE}
                            action={() => onAddCustomToken(addressFull)}
                        />
                    </BaseView>
                )}
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    tokenIcon: {
        width: 20,
        height: 20,
    },
    imageContainer: {
        borderRadius: 30,
        padding: 10,
    },
    imageShadow: {
        width: "auto",
    },
})
