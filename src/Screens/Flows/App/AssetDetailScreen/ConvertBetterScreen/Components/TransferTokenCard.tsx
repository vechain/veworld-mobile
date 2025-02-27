import React, { useMemo } from "react"
import { Image, StyleSheet } from "react-native"
import { BaseView, BaseText, BaseIcon } from "~Components"
import { B3TR, COLORS, ColorThemeType, SCREEN_WIDTH, VOT3 } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"

enum PROVENANCE {
    FROM = "FROM",
    TO = "TO",
}

type TransferTokenCardGroupProps = {
    fromToken?: FungibleToken
    toToken?: FungibleToken
}

export const TransferTokenCardGroup: React.FC<TransferTokenCardGroupProps> = ({ fromToken, toToken }) => {
    const { styles, theme } = useThemedStyles(baseGroupStyles)

    return (
        <BaseView style={[styles.container]}>
            <BaseView borderRadius={16} bg={theme.colors.convertBetterCard.inputBg}>
                <TransferTokenCard provenance={PROVENANCE.FROM} token={fromToken} />
                <BaseView style={[styles.separator]} />
                <BaseIcon
                    style={[styles.icon]}
                    name={"icon-arrow-down"}
                    color={COLORS.WHITE}
                    size={24}
                    bg={theme.colors.switcher}
                    iconPadding={3}
                />
                <TransferTokenCard provenance={PROVENANCE.TO} token={toToken} />
            </BaseView>
        </BaseView>
    )
}

const baseGroupStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        separator: {
            width: "100%",
            borderWidth: 1,
            borderColor: theme.colors.background,
        },
        icon: {
            position: "absolute",
            top: "50%",
            right: 20,
            marginTop: -20,
        },
    })

type Props = {
    token?: FungibleToken

    provenance: PROVENANCE
}

export const TransferTokenCard: React.FC<Props> = ({ token, provenance }) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const provenanceTitle = useMemo(() => (provenance === PROVENANCE.FROM ? LL.FROM() : LL.TO()), [LL, provenance])

    const renderIcon = useMemo(() => {
        if (token?.symbol === B3TR.symbol) return B3TR.icon
        if (token?.symbol === VOT3.symbol) return VOT3.icon

        return token?.icon
    }, [token?.icon, token?.symbol])

    return (
        <BaseView py={12} px={16} style={{ width: SCREEN_WIDTH - 40 }} alignItems="flex-start">
            <BaseText typographyFont="buttonPrimary">{provenanceTitle}</BaseText>

            <BaseView flexDirection="row" py={8} justifyContent="space-between">
                <BaseView flex={1} flexDirection="row" style={[styles.tokenContainer]}>
                    <Image source={{ uri: renderIcon }} width={36} height={36} />
                    <BaseText typographyFont="subSubTitleSemiBold">{token?.symbol}</BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        tokenContainer: {
            gap: 12,
        },
    })
