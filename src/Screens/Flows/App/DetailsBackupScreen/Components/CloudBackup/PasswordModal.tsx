import React, { FC } from "react"
import { RequireUserPassword } from "~Components"

type Props = {
    isOpen: boolean
    onClose: () => void
    onSuccess: (password: string) => void
}

export const PasswordModal: FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    if (!isOpen) {
        return null
    }

    return <RequireUserPassword isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
}
