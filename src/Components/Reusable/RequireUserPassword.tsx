import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { BaseIcon, BaseModal, IBaseModal } from "~Components"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"

interface IRequireUserPassword extends Omit<IBaseModal, "children"> {
    onSuccess: (password: string) => void
}
export const RequireUserPassword: React.FC<IRequireUserPassword> = memo(
    ({ isOpen, onClose, onSuccess }) => {
        const theme = useTheme()

        return (
            <BaseModal isOpen={isOpen} onClose={onClose}>
                <BaseIcon
                    style={backButtonHeaderStyle.backButton}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={onClose}
                />
                <LockScreen
                    onSuccess={onSuccess}
                    scenario={LOCKSCREEN_SCENARIO.UNLOCK_WALLET}
                />
            </BaseModal>
        )
    },
)

const backButtonHeaderStyle = StyleSheet.create({
    backButton: { paddingHorizontal: 16, alignSelf: "flex-start" },
})
