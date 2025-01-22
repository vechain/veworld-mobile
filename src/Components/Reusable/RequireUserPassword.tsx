import React, { memo } from "react"
import { BaseModal, BaseView, IBaseModal } from "~Components"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"

interface IRequireUserPassword extends Omit<IBaseModal, "children"> {
    onSuccess: (password: string) => void
    onClose: () => void
    scenario?: LOCKSCREEN_SCENARIO
    isValidatePassword?: boolean
}

export const RequireUserPassword: React.FC<IRequireUserPassword> = memo(
    ({ isOpen, onClose, onSuccess, scenario, isValidatePassword = true }) => {
        return (
            <BaseModal isOpen={isOpen} onClose={onClose}>
                <BaseView justifyContent="flex-start" w={100}>
                    <LockScreen
                        onSuccess={onSuccess}
                        onBack={onClose}
                        scenario={scenario ?? LOCKSCREEN_SCENARIO.UNLOCK_WALLET}
                        isValidatePassword={isValidatePassword}
                    />
                </BaseView>
            </BaseModal>
        )
    },
)
