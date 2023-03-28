import React, { useCallback } from "react"
import { BaseSwitch, BaseText, BaseView } from "~Components"

import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setIsAppLockActive } from "~Storage/Redux/Actions"
import { selectIsAppLockActive } from "~Storage/Redux/Selectors"

export const SecureApp = () => {
    const dispatch = useAppDispatch()
    const isAppLockActive = useAppSelector(selectIsAppLockActive)

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setIsAppLockActive(newValue))
            //todo: dispatch unlocked?
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
