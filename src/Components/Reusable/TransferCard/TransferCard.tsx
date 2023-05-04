import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import {
    ColorThemeType,
    FormattingUtils,
    useTheme,
    useThemedStyles,
} from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseIcon, BaseText, BaseView, PicassoAddressIcon } from "~Components"
import { WalletAccount } from "~Model"
import {
    selectContactByAddress,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type Props = {
    fromAddress: string
    toAddress: string
}

enum PROVENANCE {
    FROM = "FROM",
    TO = "TO",
}

export const TransferCard = memo(({ fromAddress, toAddress }: Props) => {
    const theme = useTheme()

    const { LL } = useI18nContext()

    const { styles } = useThemedStyles(baseStyles)

    const accounts = useAppSelector(selectVisibleAccounts)

    const fromContact = useAppSelector(selectContactByAddress(fromAddress))

    const toContact = useAppSelector(selectContactByAddress(toAddress))

    const fromContactName = useMemo(() => {
        if (fromContact) return fromContact.alias

        const account = accounts.find(
            (acc: WalletAccount) => acc.address === fromAddress,
        )

        if (account) return account.alias

        return undefined
    }, [accounts, fromAddress, fromContact])

    const toContactName = useMemo(() => {
        if (toContact) return toContact.alias

        const account = accounts.find(
            (acc: WalletAccount) => acc.address === toAddress,
        )

        if (account) return account.alias

        return undefined
    }, [accounts, toAddress, toContact])

    const fromAddressShort = useMemo(() => {
        return FormattingUtils.humanAddress(fromAddress, 4, 6)
    }, [fromAddress])

    const toAddressShort = useMemo(() => {
        return FormattingUtils.humanAddress(toAddress, 4, 6)
    }, [toAddress])

    const renderDetailsFromProvenance = useCallback(
        (provenance: PROVENANCE) => {
            const address =
                provenance === PROVENANCE.FROM ? fromAddress : toAddress

            const addressShort =
                provenance === PROVENANCE.FROM
                    ? fromAddressShort
                    : toAddressShort

            const contactName =
                provenance === PROVENANCE.FROM ? fromContactName : toContactName

            return (
                <BaseView flexDirection="row" py={8}>
                    <PicassoAddressIcon address={address} size={40} />
                    <BaseView flexDirection="column" pl={12}>
                        {contactName && (
                            <BaseText typographyFont="subSubTitle">
                                {contactName}
                            </BaseText>
                        )}
                        <BaseText
                            typographyFont={
                                contactName ? "captionRegular" : "button"
                            }
                            pt={3}>
                            {addressShort}
                        </BaseText>
                    </BaseView>
                    {!contactName && (
                        <BaseView pl={12}>
                            <BaseIcon
                                name={"account-plus-outline"}
                                size={20}
                                bg={theme.colors.primary}
                                iconPadding={3}
                                color={theme.colors.textReversed}
                            />
                        </BaseView>
                    )}
                </BaseView>
            )
        },
        [
            fromAddress,
            fromAddressShort,
            fromContactName,
            theme.colors.primary,
            theme.colors.textReversed,
            toAddress,
            toAddressShort,
            toContactName,
        ],
    )

    return (
        <DropShadow style={[theme.shadows.card, styles.container]}>
            <BaseView bg={theme.colors.card} style={styles.view}>
                {/* FROM View */}
                <BaseView py={12} px={16}>
                    <BaseText typographyFont="buttonPrimary">
                        {LL.FROM()}
                    </BaseText>
                    {renderDetailsFromProvenance(PROVENANCE.FROM)}
                </BaseView>

                {/* SEPARATOR */}
                <BaseView style={styles.separator} />
                <BaseIcon
                    style={styles.icon}
                    name={"arrow-down"}
                    color={COLORS.WHITE}
                    size={24}
                    bg={theme.colors.switcher}
                    iconPadding={3}
                />

                {/* TO View */}
                <BaseView py={12} px={16}>
                    <BaseText typographyFont="buttonPrimary">
                        {LL.TO()}
                    </BaseText>
                    {renderDetailsFromProvenance(PROVENANCE.TO)}
                </BaseView>
            </BaseView>
        </DropShadow>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        view: {
            borderRadius: 16,
        },
        separator: {
            width: "100%",
            borderWidth: 1,
            borderColor: theme.colors.background,
        },
        icon: {
            position: "absolute",
            top: "50%",
            marginTop: -20,
            right: 20,
        },
    })
