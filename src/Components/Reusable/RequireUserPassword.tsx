import React from "react"
import { BaseModal, IBaseModal } from "~Components"
import { useI18nContext } from "~i18n"
import { LockScreen } from "~Screens"

interface IRequireUserPassword extends Omit<IBaseModal, "children"> {
    onSuccess: (password: string) => void
}
export const RequireUserPassword: React.FC<IRequireUserPassword> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { LL } = useI18nContext()

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <LockScreen
                onSuccess={onSuccess}
                title={LL.TITLE_USER_PIN()}
                subTitle={LL.SB_SECOND_ACCESS_PIN()}
            />
        </BaseModal>
    )
}
