import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { FormattingUtils, useTheme } from "~Common"
import { compareAddresses } from "~Common/Utils/AddressUtils/AddressUtils"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { WalletAccount } from "~Model"
import { useAppDispatch } from "~Storage/Redux"
import { toggleAccountVisibility } from "~Storage/Redux/Actions"

type Props = {
    account: WalletAccount
    selectedAccount: WalletAccount
}
export const AccountDetailBox: React.FC<Props> = memo(
    ({ account, selectedAccount }) => {
        const theme = useTheme()
        const dispatch = useAppDispatch()
        const isSelected = useMemo(
            () => compareAddresses(selectedAccount?.address, account.address),
            [account.address, selectedAccount?.address],
        )

        const toggleVisibility = useCallback(() => {
            dispatch(toggleAccountVisibility({ address: account.address }))
        }, [dispatch, account])

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    action={() => {}}
                    justifyContent="space-between"
                    bg={
                        !account.visible
                            ? theme.colors.neutralDisabled
                            : undefined
                    }
                    containerStyle={baseStyles.container}>
                    <BaseText style={baseStyles.alias}>
                        {account.alias}
                    </BaseText>
                    <BaseView style={baseStyles.rightSubContainer}>
                        <BaseText style={baseStyles.address} fontSize={10}>
                            {FormattingUtils.humanAddress(
                                account.address,
                                4,
                                6,
                            )}
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
    },
)

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
