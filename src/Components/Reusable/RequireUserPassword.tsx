import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { BaseIcon, BaseModal, BaseView, IBaseModal } from "~Components"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"

interface IRequireUserPassword extends Omit<IBaseModal, "children"> {
    onSuccess: (password: string) => void
    scenario?: LOCKSCREEN_SCENARIO
    isValidatePassword?: boolean
}
export const RequireUserPassword: React.FC<IRequireUserPassword> = memo(
    ({ isOpen, onClose, onSuccess, scenario, isValidatePassword = true }) => {
        const theme = useTheme()

        return (
            <BaseModal isOpen={isOpen} onClose={onClose}>
                <BaseView justifyContent="flex-start">
                    <BaseIcon
                        style={backButtonHeaderStyle.backButton}
                        size={36}
                        name="chevron-left"
                        color={theme.colors.text}
                        action={onClose}
                    />
                    <LockScreen
                        onSuccess={onSuccess}
                        scenario={scenario ?? LOCKSCREEN_SCENARIO.UNLOCK_WALLET}
                        isValidatePassword={isValidatePassword}
                    />
                </BaseView>
            </BaseModal>
        )
    },
)

const backButtonHeaderStyle = StyleSheet.create({
    backButton: { paddingHorizontal: 16, alignSelf: "flex-start" },
})
