import React, { useCallback } from "react"
import { BaseSwitch, BaseText, BaseView } from "~Components"
import { WALLET_STATUS } from "~Model"

import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setAppLockStatus, setIsAppLockActive } from "~Storage/Redux/Actions"
import { selectIsAppLockActive } from "~Storage/Redux/Selectors"

export const SecureApp = () => {
    const dispatch = useAppDispatch()
    const isAppLockActive = useAppSelector(selectIsAppLockActive)

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setIsAppLockActive(newValue))
            dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
        },
        [dispatch],
    )

    return (
        <BaseView w={100} flexDirection="row">
            <BaseText>Secure App</BaseText>
            <BaseSwitch onValueChange={toggleSwitch} value={isAppLockActive} />
        </BaseView>
    )
}
