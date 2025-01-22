import React from "react"
import { BaseModal, BaseView } from "~Components"
import { UserCreatePasswordScreen } from "~Screens"

interface CreatePasswordModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (pin: string) => void
}

export const CreatePasswordModal: React.FC<CreatePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <BaseView justifyContent="flex-start" w={100}>
                <UserCreatePasswordScreen onSuccess={onSuccess} onBack={onClose} />
            </BaseView>
        </BaseModal>
    )
}
