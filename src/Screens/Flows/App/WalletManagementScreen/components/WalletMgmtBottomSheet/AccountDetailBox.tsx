import React, { memo, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { useRenameAccount, useThemedStyles } from "~Hooks"
import { FormattingUtils } from "~Utils"
import {
    BaseBottomSheetTextInput,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { AccountWithDevice, WalletAccount } from "~Model"
import {
    selectVetBalanceByAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { toggleAccountVisibility } from "~Storage/Redux/Actions"
import { ColorThemeType, VET } from "~Constants"

type Props = {
    account: WalletAccount
    isSelected: boolean
    isBalanceVisible: boolean
    confirmRemoveAccount: (account: AccountWithDevice) => void
}
export const AccountDetailBox: React.FC<Props> = memo(
    ({ account, isSelected, isBalanceVisible, confirmRemoveAccount }) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const dispatch = useAppDispatch()

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

        const vetBalance = useAppSelector(state =>
            selectVetBalanceByAccount(state, account.address),
        )

        const balance = useMemo(() => {
            if (!isBalanceVisible) {
                return "•••• " + VET.symbol
            }

            return `${vetBalance} ${VET.symbol}`
        }, [isBalanceVisible, vetBalance])

        const toggleVisibility = useCallback(() => {
            dispatch(toggleAccountVisibility({ address: account.address }))
        }, [dispatch, account])

        const deleteAccount = useCallback(() => {
            confirmRemoveAccount(account as AccountWithDevice)
        }, [confirmRemoveAccount, account])

        const handleFocus = useCallback(
            () => setBackupAlias(accountAlias),
            [accountAlias],
        )

        const cardBgColor = useMemo(
            () => (!account.visible ? theme.colors.neutralDisabled : undefined),
            [account.visible, theme.colors.neutralDisabled],
        )
        const cardOpacity = useMemo(
            () => (!account.visible ? 0.7 : undefined),
            [account.visible],
        )

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    haptics="Light"
                    justifyContent="space-between"
                    bg={cardBgColor}
                    innerContainerStyle={
                        isSelected ? styles.selected : styles.notSelected
                    }
                    containerStyle={styles.container}>
                    <BaseView style={styles.aliasContainer}>
                        <BaseBottomSheetTextInput
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
                        />
                    </BaseView>
                    <BaseView style={styles.rightSubContainer}>
                        <BaseText style={styles.address} fontSize={10}>
                            {FormattingUtils.humanAddress(
                                account.address,
                                4,
                                6,
                            )}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText fontSize={10}>{balance}</BaseText>
                    </BaseView>
                </BaseTouchableBox>
                <BaseIcon
                    haptics="Light"
                    size={24}
                    style={styles.eyeIcon}
                    name={account.visible ? "eye-outline" : "eye-off-outline"}
                    bg={theme.colors.secondary}
                    disabled={isSelected}
                    action={toggleVisibility}
                />
                <BaseIcon
                    haptics="Light"
                    size={24}
                    style={styles.deleteIcon}
                    name={"delete"}
                    bg={theme.colors.danger}
                    disabled={isSelected}
                    action={deleteAccount}
                    color={theme.colors.background}
                />
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
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        eyeIcon: { marginLeft: 16 },
        deleteIcon: { marginLeft: 16 },
    })
