import { default as React } from "react"
import { TouchableOpacity } from "react-native"
import { AccountIcon, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const Header = () => {
    const account = useAppSelector(selectSelectedAccount)
    return (
        <BaseView flexDirection="row" pt={8} justifyContent="space-between" px={16}>
            <TouchableOpacity>
                <BaseView flexDirection="row" gap={12} p={8} pr={16} bg="rgba(255, 255, 255, 0.05)" borderRadius={99}>
                    <AccountIcon address={account.address} size={24} borderRadius={100} />
                    <BaseText typographyFont="captionSemiBold" color={COLORS.PURPLE_LABEL}>
                        {account.alias}
                    </BaseText>
                </BaseView>
            </TouchableOpacity>

            <BaseView flexDirection="row" gap={12}>
                <TouchableOpacity>
                    <BaseView borderRadius={99} p={10} bg="rgba(255, 255, 255, 0.05)">
                        <BaseIcon name="icon-wallet" color={COLORS.PURPLE_LABEL} size={20} />
                    </BaseView>
                </TouchableOpacity>
                <TouchableOpacity>
                    <BaseView borderRadius={99} p={10} bg="rgba(255, 255, 255, 0.05)">
                        <BaseIcon name="icon-scanQR" color={COLORS.PURPLE_LABEL} size={20} />
                    </BaseView>
                </TouchableOpacity>
            </BaseView>
        </BaseView>
    )
}
