import { AppLock, useObjectListener, useRealm } from "~Storage"

export const useAppLockEntity = () => {
    const { cache } = useRealm()

    const appLockEntity = useObjectListener(
        AppLock.getName(),
        AppLock.getPrimaryKey(),
        cache,
    ) as AppLock

    const { status: appLockStatus } = appLockEntity

    return { appLockStatus, appLockEntity }
}
