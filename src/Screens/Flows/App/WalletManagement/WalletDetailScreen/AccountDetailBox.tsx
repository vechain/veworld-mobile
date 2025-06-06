import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useCopyClipboard, useSetSelectedAccount, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { WalletAccount } from "~Model"
import { Routes } from "~Navigation"
import { AddressUtils } from "~Utils"
import { AccountDetailFiatBalance } from "./components"

type Props = {
    account: WalletAccount
    isSelected: boolean
    isBalanceVisible: boolean
    isDisabled: boolean
    canClaimUsername?: boolean
    isEditable?: boolean
    onEditPress?: (account: WalletAccount) => void
}
export const AccountDetailBox: React.FC<Props> = memo(
    ({ account, isSelected, isDisabled, isBalanceVisible, canClaimUsername, isEditable = true, onEditPress }) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const { LL } = useI18nContext()
        const nav = useNavigation()

        const { onSetSelectedAccount } = useSetSelectedAccount()

        const { name: vnsName, address: vnsAddress } = useVns({
            name: "",
            address: account.address,
        })

        const { onCopyToClipboard } = useCopyClipboard()

        const cardBgColor = useMemo(
            () => (isDisabled ? theme.colors.neutralDisabled : undefined),
            [isDisabled, theme.colors.neutralDisabled],
        )
        const cardOpacity = useMemo(() => (isDisabled ? 0.7 : undefined), [isDisabled])

        const nameOrAddressFrom = useMemo(
            () => vnsName || AddressUtils.humanAddress(vnsAddress || account.address),
            [account.address, vnsAddress, vnsName],
        )

        const onClaimPress = useCallback(() => {
            onSetSelectedAccount({ address: account.address })

            nav.navigate(Routes.CLAIM_USERNAME)
        }, [account.address, nav, onSetSelectedAccount])

        return (
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                bg={cardBgColor}
                style={[isSelected ? styles.selected : styles.notSelected, styles.container]}>
                <BaseView style={styles.leftSubContainer} justifyContent="flex-start" alignItems="flex-start">
                    <BaseView style={styles.aliasContainer}>
                        <BaseText typographyFont={isSelected ? "bodyBold" : "bodyMedium"} color={theme.colors.text}>
                            {account.alias}
                        </BaseText>
                    </BaseView>
                    <BaseView style={(styles.leftSubContainer, { opacity: cardOpacity })}>
                        <BaseTouchable
                            style={styles.addressContainer}
                            action={() => onCopyToClipboard(account.address, LL.COMMON_LBL_ADDRESS())}>
                            <BaseText style={styles.address} typographyFont="captionRegular">
                                {nameOrAddressFrom}
                            </BaseText>
                            <BaseIcon color={theme.colors.text} style={styles.address} size={12} name="icon-copy" />
                        </BaseTouchable>

                        <BaseSpacer height={4} />
                        <AccountDetailFiatBalance account={account} isVisible={isBalanceVisible} isLoading={false} />
                    </BaseView>
                </BaseView>
                {/* Actions */}
                <BaseView flexDirection="row" style={styles.rightSubContainer}>
                    {canClaimUsername && (
                        <BaseButton title={LL.BTN_CLAIM()} action={onClaimPress} style={styles.claimBtn} />
                    )}
                    {isEditable && (
                        <BaseTouchable action={() => onEditPress?.(account)}>
                            <BaseIcon
                                name="icon-editBox"
                                bg={theme.isDark ? theme.colors.cardBorder : theme.colors.transparent}
                                color={theme.isDark ? theme.colors.text : theme.colors.alertDescription}
                                style={[styles.editBtn]}
                                size={16}
                                px={16}
                                py={12}
                                borderRadius={6}
                            />
                        </BaseTouchable>
                    )}
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        selected: {
            borderWidth: 2,
            borderColor: theme.isDark ? COLORS.WHITE : theme.colors.primary,
        },
        notSelected: {
            borderWidth: 2,
            borderColor: theme.colors.transparent,
        },
        alias: {
            flex: 1,
            paddingHorizontal: 0,
            marginLeft: -16,
        },
        aliasContainer: {
            flex: 1,
        },
        addressContainer: {
            flexDirection: "row",
            gap: 4,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            flexBasis: 85,
            flex: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        leftSubContainer: { flexDirection: "column", alignItems: "flex-start", gap: 4 },
        rightSubContainer: {
            gap: 8,
        },
        claimBtn: {
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        editBtn: {
            borderRadius: 6,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
        },
        eyeIcon: { marginLeft: 16 },
        deleteIcon: { marginLeft: 16 },
    })
