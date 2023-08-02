import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { WalletAccount } from "~Model"
import {
    selectVetBalanceByAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { toggleAccountVisibility } from "~Storage/Redux/Actions"
import { VET } from "~Constants"

type Props = {
    account: WalletAccount
    isSelected: boolean
    isBalanceVisible: boolean
}
export const AccountDetailBox: React.FC<Props> = memo(
    ({ account, isSelected, isBalanceVisible }) => {
        const theme = useTheme()
        const dispatch = useAppDispatch()

        const vetBalance = useAppSelector(state =>
            selectVetBalanceByAccount(state, account.address),
        )

        const balance = useMemo(() => {
            if (!isBalanceVisible) {
                return "**** " + VET.symbol
            }

            return `${vetBalance} ${VET.symbol}`
        }, [isBalanceVisible, vetBalance])

        const toggleVisibility = useCallback(() => {
            dispatch(toggleAccountVisibility({ address: account.address }))
        }, [dispatch, account])

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    haptics="Light"
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
                        <BaseText fontSize={10}>{balance}</BaseText>
                    </BaseView>
                </BaseTouchableBox>
                <BaseIcon
                    haptics="Light"
                    size={24}
                    style={baseStyles.eyeIcon}
                    name={account.visible ? "eye-outline" : "eye-off-outline"}
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
