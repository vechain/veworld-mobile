import { useCallback } from "react"
import { BiometricsUtils, useBiometrics } from "~Common"
import { SecurityLevelType } from "~Model"
import {
    selectHasOnboarded,
    selectLastSecuritylevel,
    selectUserSelectedSecurity,
    setIsSecurityDowngrade,
    setLastSecurityLevel,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useSecurityDowngrade = () => {
    const biometrics = useBiometrics()
    const dispatch = useAppDispatch()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const lastSecurityLevel = useAppSelector(selectLastSecuritylevel)
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)

    const dispatcher = useCallback(
        (level: SecurityLevelType, isDowngrade: boolean = false) => {
            dispatch(setIsSecurityDowngrade(isDowngrade))
            dispatch(setLastSecurityLevel(level))
        },
        [dispatch],
    )

    const securityDowngrade = useCallback(() => {
        // exit early if user has selected password as it is impossible to downgrade
        if (userSelectedSecurity === SecurityLevelType.PASSWORD) return

        // exit early if biometrics object is not ready
        if (!biometrics.currentSecurityLevel) return

        // set state and exit if user has not onboarded yet
        if (
            lastSecurityLevel === SecurityLevelType.NONE &&
            biometrics.currentSecurityLevel
        ) {
            dispatcher(biometrics.currentSecurityLevel)
            return
        }

        // set state and exit if we have a downgrade
        if (
            BiometricsUtils.isSecurityDowngrade(
                lastSecurityLevel,
                biometrics?.currentSecurityLevel,
                userHasOnboarded,
            )
        ) {
            dispatcher(biometrics.currentSecurityLevel, true)
            return
        }

        // set state if we have an upgrade
        if (
            BiometricsUtils.isSecurityUpgrade(
                lastSecurityLevel,
                biometrics.currentSecurityLevel,
                userHasOnboarded,
            )
        ) {
            dispatcher(biometrics.currentSecurityLevel, false)
        }
    }, [
        userSelectedSecurity,
        biometrics.currentSecurityLevel,
        lastSecurityLevel,
        userHasOnboarded,
        dispatcher,
    ])

    return { securityDowngrade }
}
