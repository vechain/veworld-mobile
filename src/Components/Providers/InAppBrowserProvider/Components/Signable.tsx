import React, { ReactNode, useCallback } from "react"
import { RequireUserPassword } from "~Components/Reusable"
import { useCheckIdentity } from "~Hooks"

type Props<TArgs> = {
    args: TArgs
    onSign: (args: TArgs & { password?: string }) => void | Promise<void>
    children: (args: { checkIdentityBeforeOpening: () => Promise<void>; isBiometricsEmpty: boolean }) => ReactNode
}

export const Signable = <TArgs,>({ args, onSign, children }: Props<TArgs>) => {
    const onIdentityConfirmed = useCallback(
        async (password?: string) => {
            await onSign({ ...args, password })
        },
        [args, onSign],
    )
    const {
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({ onIdentityConfirmed, allowAutoPassword: true })
    return (
        <>
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
            {children({ checkIdentityBeforeOpening, isBiometricsEmpty })}
        </>
    )
}
