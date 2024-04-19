import React, { memo, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { useRenameAccount, useThemedStyles, useVns } from "~Hooks"
import { AddressUtils, BigNutils } from "~Utils"
import { BaseTextInput, BaseSpacer, BaseText, BaseView } from "~Components"
import { WalletAccount } from "~Model"
import { selectVetBalanceByAccount, useAppSelector } from "~Storage/Redux"
import { ColorThemeType, VET } from "~Constants"

type Props = {
    account: WalletAccount
    isSelected: boolean
    isBalanceVisible: boolean
    isDisabled: boolean
    isEditable?: boolean
}
export const AccountDetailBox: React.FC<Props> = memo(
    ({ account, isSelected, isBalanceVisible, isDisabled, isEditable = true }) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const { changeAccountAlias } = useRenameAccount(account)

        const [backupAlias, setBackupAlias] = useState(account.alias ?? "")
        const [accountAlias, setAccountAlias] = useState(account.alias ?? "")

        const onRenameAccount = (name: string) => {
            setAccountAlias(name)
            if (name === "") {
                changeAccountAlias({
                    newAlias: backupAlias ?? account.alias ?? "",
                })
            } else {
                changeAccountAlias({ newAlias: name })
            }
        }

        const vetBalance = useAppSelector(state => selectVetBalanceByAccount(state, account.address))

        const balance = useMemo(() => {
            if (!isBalanceVisible) {
                return "•••• " + VET.symbol
            }

            return `${BigNutils(vetBalance).toHuman(VET.decimals).toTokenFormat_string(2)} ${VET.symbol}`
        }, [isBalanceVisible, vetBalance])

        const handleFocus = useCallback(() => setBackupAlias(accountAlias), [accountAlias])

        const cardBgColor = useMemo(
            () => (isDisabled ? theme.colors.neutralDisabled : undefined),
            [isDisabled, theme.colors.neutralDisabled],
        )
        const cardOpacity = useMemo(() => (isDisabled ? 0.7 : undefined), [isDisabled])

        const { name: vnsName, address: vnsAddress } = useVns({ name: "", address: account.address })

        return (
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                bg={cardBgColor}
                style={[isSelected ? styles.selected : styles.notSelected, styles.container]}>
                <BaseView style={styles.aliasContainer}>
                    <BaseTextInput
                        disabled={!isEditable}
                        placeholder={account?.alias}
                        value={accountAlias}
                        setValue={onRenameAccount}
                        style={[
                            styles.alias,
                            {
                                backgroundColor: cardBgColor,
                                opacity: cardOpacity,
                            },
                        ]}
                        inputContainerStyle={{
                            backgroundColor: cardBgColor,
                            opacity: cardOpacity,
                        }}
                        onFocus={handleFocus}
                        maxLength={20}
                    />
                </BaseView>
                <BaseView style={(styles.rightSubContainer, { opacity: cardOpacity })} alignItems="flex-end">
                    <BaseText style={styles.address} fontSize={10}>
                        {vnsName || AddressUtils.humanAddress(vnsAddress ?? account.address, 4, 6)}
                    </BaseText>

                    <BaseSpacer height={4} />
                    <BaseText fontSize={10}>{balance}</BaseText>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
        alias: {
            flex: 1,
            paddingHorizontal: 0,
            marginLeft: -16,
        },
        aliasContainer: {
            flex: 1,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            flex: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        eyeIcon: { marginLeft: 16 },
        deleteIcon: { marginLeft: 16 },
    })
