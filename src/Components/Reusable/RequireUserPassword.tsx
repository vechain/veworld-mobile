import React, { memo } from "react"
import { BaseIcon, BaseModal, BaseView, IBaseModal } from "~Components"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"
import { useTheme } from "~Hooks"

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
                    <BaseView flexDirection="row" alignItems="center">
                        <BaseIcon
                            color={theme.colors.text}
                            haptics="Light"
                            px={12}
                            size={36}
                            name="icon-chevron-left"
                            action={onClose}
                        />
                    </BaseView>

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
