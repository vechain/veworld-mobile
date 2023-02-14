import React from "react"
import { BaseModal, IBaseModal } from "~Components"
import { LockScreen } from "~Screens/LockScreen/LockScreen"

interface IRequireUserPassword extends Omit<IBaseModal, "children"> {
    onSuccess: (password: string) => void
}
export const RequireUserPassword: React.FC<IRequireUserPassword> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <LockScreen onSuccess={onSuccess} />
        </BaseModal>
    )
}
