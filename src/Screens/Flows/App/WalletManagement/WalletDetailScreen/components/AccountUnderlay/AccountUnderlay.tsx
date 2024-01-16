import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseIcon, BaseTouchable, BaseView } from "~Components/Base"
import { toggleAccountVisibility } from "~Storage/Redux"
import { AccountWithDevice } from "~Model"
import { useDispatch } from "react-redux"

type Props = {
    confirmRemoveAccount: (account: AccountWithDevice) => void
    account: AccountWithDevice
    isSelected: boolean
}
export const AccountUnderlay: React.FC<Props> = ({ confirmRemoveAccount, account, isSelected }) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const dispatch = useDispatch()

    const toggleVisibility = useCallback(() => {
        dispatch(toggleAccountVisibility({ address: account.address }))
    }, [dispatch, account])

    const deleteAccount = useCallback(() => {
        confirmRemoveAccount(account as AccountWithDevice)
    }, [confirmRemoveAccount, account])

    return (
        <BaseView style={styles.underlayContainer} flexDirection="row">
            <BaseTouchable
                action={toggleVisibility}
                style={[styles.underlayItem, styles.eyeUnderlay, isSelected ? styles.disabledButton : {}]}
                disabled={isSelected}>
                <BaseIcon
                    size={24}
                    color={theme.colors.card}
                    testID="AccountUnderlay_DeleteIcon"
                    haptics="Light"
                    name={account.visible ? "eye-outline" : "eye-off-outline"}
                    bg={theme.colors.secondary}
                />
            </BaseTouchable>
            <BaseTouchable
                action={deleteAccount}
                style={[styles.underlayItem, styles.deleteUnderlay, isSelected ? styles.disabledButton : {}]}
                disabled={isSelected}>
                <BaseIcon
                    name={"delete"}
                    size={24}
                    bg={theme.colors.danger}
                    color={theme.colors.card}
                    testID="AccountUnderlay_DeleteIcon"
                />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underlayContainer: {
            height: "100%",
            justifyContent: "flex-end",
        },
        eyeUnderlay: {
            backgroundColor: theme.colors.secondary,
            paddingLeft: 50,
            width: 120,
        },
        deleteUnderlay: {
            width: 70,
            backgroundColor: theme.colors.danger,
            borderTopEndRadius: 16,
            borderBottomEndRadius: 16,
        },
        underlayItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
        },
        disabledButton: {
            opacity: 0.5,
        },
    })
