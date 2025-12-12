import React from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BaseModal, BaseView } from "~Components"
import { UserCreatePasswordScreen } from "~Screens"

interface CreatePasswordModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (pin: string) => void
}

export const CreatePasswordModal: React.FC<CreatePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { top } = useSafeAreaInsets()
    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <BaseView justifyContent="flex-start" w={100} style={{ marginTop: top }}>
                <UserCreatePasswordScreen onSuccess={onSuccess} onBack={onClose} />
            </BaseView>
        </BaseModal>
    )
}
