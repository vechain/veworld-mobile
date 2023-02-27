import { Config, useObjectListener, useRealm } from "~Storage"

export const useConfigEntity = () => {
    const { store } = useRealm()

    const configEntity = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    return { configEntity }
}
