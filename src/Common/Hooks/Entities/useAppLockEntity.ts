import { useMemo } from "react"
import { AppLock, useObjectListener, useRealm } from "~Storage"

export const useAppLockEntity = () => {
    const { cache } = useRealm()

    const appLockEntity = useObjectListener(
        AppLock.getName(),
        AppLock.getPrimaryKey(),
        cache,
    ) as AppLock

    const appLockStatus = useMemo(
        () => appLockEntity?.status,
        [appLockEntity?.status],
    )

    return { appLockStatus, appLockEntity }
}
