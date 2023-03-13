import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { FormattingUtils, useTheme } from "~Common"
import { useUserPreferencesEntity } from "~Common/Hooks/Entities"
import { compareAddresses } from "~Common/Utils/AddressUtils/AddressUtils"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Account, useRealm } from "~Storage"

type Props = {
    account: Account
}
export const AccountDetailBox: React.FC<Props> = ({ account }) => {
    const theme = useTheme()

    const { store } = useRealm()

    const { selectedAccount } = useUserPreferencesEntity()

    const isSelected = useMemo(
        () => compareAddresses(selectedAccount, account.address),
        [selectedAccount, account],
    )

    const toggleVisibility = useCallback(() => {
        if (!isSelected)
            store.write(() => {
                account.visible = !account.visible
            })
    }, [account, store, isSelected])

    return (
        <BaseView
            w={100}
            orientation="row"
            align="center"
            justify="space-between">
            <BaseTouchableBox
                action={() => {}}
                justifyContent="space-between"
                bg={!account.visible ? theme.colors.neutralDisabled : undefined}
                containerStyle={baseStyles.container}>
                <BaseText style={baseStyles.alias}>{account.alias}</BaseText>
                <BaseView style={baseStyles.rightSubContainer}>
                    <BaseText style={baseStyles.address} fontSize={10}>
                        {FormattingUtils.humanAddress(account.address, 4, 6)}
                    </BaseText>
                    <BaseSpacer height={4} />
                    <BaseText fontSize={10}>1.2235 VET</BaseText>
                </BaseView>
            </BaseTouchableBox>
            <BaseIcon
                size={24}
                style={baseStyles.eyeIcon}
                name={account.visible ? "eye-off-outline" : "eye-outline"}
                bg={theme.colors.secondary}
                disabled={isSelected}
                action={toggleVisibility}
            />
        </BaseView>
    )
}
const baseStyles = StyleSheet.create({
    alias: {
        opacity: 0.7,
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
    eyeIcon: { marginLeft: 16, flex: 0.1 },
})
