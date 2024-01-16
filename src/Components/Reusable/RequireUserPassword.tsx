import React, { memo } from "react"
import { BaseModal, IBaseModal } from "~Components"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"

interface IRequireUserPassword extends Omit<IBaseModal, "children"> {
    onSuccess: (password: string) => void
}
export const RequireUserPassword: React.FC<IRequireUserPassword> = memo(
    ({ isOpen, onClose, onSuccess }) => {
        return (
            <BaseModal isOpen={isOpen} onClose={onClose}>
                <LockScreen
                    onSuccess={onSuccess}
                    scenario={LOCKSCREEN_SCENARIO.UNLOCK_WALLET}
                />
            </BaseModal>
        )
    },
)
