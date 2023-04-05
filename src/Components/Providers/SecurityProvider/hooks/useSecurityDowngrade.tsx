import { useCallback } from "react"
import { BiometricsUtils, useBiometrics } from "~Common"
import {
    SecurityLevelType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
} from "~Model"
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
        (level: TSecurityLevel, isDowngrade?: boolean) => {
            isDowngrade && dispatch(setIsSecurityDowngrade(isDowngrade))
            dispatch(setLastSecurityLevel(level))
        },
        [dispatch],
    )

    const securityDowngrade = useCallback(() => {
        if (userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD) return
        if (!biometrics.currentSecurityLevel) return

        if (
            lastSecurityLevel === SecurityLevelType.NONE &&
            biometrics.currentSecurityLevel
        ) {
            console.log("init")
            dispatcher(biometrics.currentSecurityLevel)
            return
        }

        if (
            BiometricsUtils.isSecurityDowngrade(
                lastSecurityLevel,
                biometrics?.currentSecurityLevel,
                userHasOnboarded,
            )
        ) {
            console.log("isSecurityDowngrade")
            dispatcher(biometrics.currentSecurityLevel, true)
            return
        }

        if (
            BiometricsUtils.isSecurityUpgrade(
                lastSecurityLevel,
                biometrics.currentSecurityLevel,
                userHasOnboarded,
            )
        ) {
            console.log("isSecurityUpgrade")
            dispatcher(biometrics.currentSecurityLevel, false)
            return
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
