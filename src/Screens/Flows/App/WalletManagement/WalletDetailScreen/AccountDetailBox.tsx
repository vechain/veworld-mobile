import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useCopyClipboard, useThemedStyles, useVns } from "~Hooks"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseSpacer, BaseText, BaseView, BaseButton, BaseIcon, BaseTouchable } from "~Components"
import { DEVICE_TYPE, WalletAccount } from "~Model"
import { selectVetBalanceByAccount, useAppSelector } from "~Storage/Redux"
import { COLORS, ColorThemeType, VET } from "~Constants"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

type Props = {
    account: WalletAccount
    isSelected: boolean
    isBalanceVisible: boolean
    isDisabled: boolean
    isEditable?: boolean
    onEditPress?: (account: WalletAccount) => void
}
export const AccountDetailBox: React.FC<Props> = memo(
    ({ account, isSelected, isBalanceVisible, isDisabled, isEditable = true, onEditPress }) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const { LL } = useI18nContext()
        const nav = useNavigation()

        const { name: vnsName, address: vnsAddress } = useVns({
            name: "",
            address: account.address,
        })

        const { onCopyToClipboard } = useCopyClipboard()

        const vetBalance = useAppSelector(state => selectVetBalanceByAccount(state, account.address))

        const isObservedAccount = "type" in account && account.type === DEVICE_TYPE.LOCAL_WATCHED

        const canClaimUsername = !vnsName && !isObservedAccount

        const balance = useMemo(() => {
            if (!isBalanceVisible) {
                return "•••• " + VET.symbol
            }

            return `${BigNutils(vetBalance).toHuman(VET.decimals).toTokenFormat_string(2)} ${VET.symbol}`
        }, [isBalanceVisible, vetBalance])

        const cardBgColor = useMemo(
            () => (isDisabled ? theme.colors.neutralDisabled : undefined),
            [isDisabled, theme.colors.neutralDisabled],
        )
        const cardOpacity = useMemo(() => (isDisabled ? 0.7 : undefined), [isDisabled])

        const nameOrAddressFrom = useMemo(
            () => vnsName || AddressUtils.humanAddress(vnsAddress || account.address, 4, 6),
            [account.address, vnsAddress, vnsName],
        )

        return (
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                bg={cardBgColor}
                style={[isSelected ? styles.selected : styles.notSelected, styles.container]}>
                <BaseView style={styles.leftSubContainer} justifyContent="flex-start" alignItems="flex-start">
                    <BaseView style={styles.aliasContainer}>
                        <BaseText
                            typographyFont="bodyBold"
                            color={isSelected ? theme.colors.textSelected : theme.colors.text}>
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
                        <BaseText typographyFont="captionRegular">{balance}</BaseText>
                    </BaseView>
                </BaseView>
                {/* Actions */}
                <BaseView flexDirection="row" style={styles.rightSubContainer}>
                    {canClaimUsername && (
                        <BaseButton
                            title={"Claim"}
                            action={() => {
                                nav.navigate(Routes.CLAIM_USERNAME)
                            }}
                            bgColor={theme.colors.actionBanner.buttonBackground}
                            textColor={theme.colors.actionBanner.buttonText}
                            style={styles.claimBtn}
                        />
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
            borderColor: theme.isDark ? COLORS.PURPLE_300 : theme.colors.primary,
        },
        notSelected: {
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
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
            flex: 1,
            borderRadius: 8,
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
