import React from "react"
import { StyleSheet } from "react-native"
import { AccountIcon, BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useThemedStyles, useVns } from "~Hooks"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"

interface Props {
    onChangeAccountPress: () => void
}

const Header: React.FC<Props> = ({ onChangeAccountPress }) => {
    const { theme } = useThemedStyles(baseStyles)
    const currentAccount = useAppSelector(selectSelectedAccount)

    const { name: vnsName } = useVns({ name: "", address: currentAccount.address })

    return (
        <BaseView w={100} px={20} pb={8} flexDirection="row" alignItems="center" justifyContent="space-between">
            <BaseTouchable testID="Chat_change_account" action={onChangeAccountPress}>
                <BaseView flexDirection="row" flex={1} pr={10} alignItems="center">
                    <AccountIcon address={currentAccount.address} size={24} />
                    <BaseText typographyFont="subTitleBold" mx={8}>
                        {vnsName ? vnsName : humanAddress(currentAccount.address, 4, 6)}
                    </BaseText>
                    <BaseIcon name="chevron-down" size={18} color={theme.colors.text} />
                </BaseView>
            </BaseTouchable>

            <BaseView flexDirection="row">
                <BaseIcon name={"plus"} size={24} color={theme.colors.text} mx={8} action={() => {}} haptics="Light" />
                <BaseIcon
                    name={"dots-vertical"}
                    size={24}
                    color={theme.colors.text}
                    action={() => {}}
                    haptics="Light"
                />
            </BaseView>
        </BaseView>
    )
}

export default Header

const baseStyles = () => StyleSheet.create({})
