import { useMemo } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import { Biometrics, Config, useCachedQuery, useStoreQuery } from "~Storage"

export const useUnlockFlow = () => {
    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    // todo: this is a workaround until the new version is installed
    const result3 = useCachedQuery(Biometrics)
    const biometrics = useMemo(() => result3.sorted("_id"), [result3])

    const unlockFlow = useMemo(() => {
        if (
            biometrics[0]?.accessControl &&
            config[0].userSelectedSecurtiy ===
                UserSelectedSecurityLevel.BIOMETRIC
        ) {
            return AppUnlockFlow.BIO_UNLOCK
        }

        if (
            config[0]?.userSelectedSecurtiy ===
            UserSelectedSecurityLevel.PASSWORD
        ) {
            return AppUnlockFlow.PASS_UNLOCK
        }

        return AppUnlockFlow.NONE
    }, [biometrics, config])

    return unlockFlow
}

export enum AppUnlockFlow {
    NONE = "NONE",
    BIO_UNLOCK = "BIO_UNLOCK",
    PASS_UNLOCK = "PASS_UNLOCK",
}
