import { ActiveHomePageTab, useObjectListener, useRealm } from "~Storage"

export const useActiveListTabEntity = () => {
    const { cache } = useRealm()

    const activeListTabEntity = useObjectListener(
        ActiveHomePageTab.getName(),
        ActiveHomePageTab.getPrimaryKey(),
        cache,
    ) as ActiveHomePageTab

    return activeListTabEntity
}
