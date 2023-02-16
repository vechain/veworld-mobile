import { useNavigation } from "@react-navigation/native"
import { useCallback, useMemo } from "react"
import { Routes } from "~Navigation"
import { Device, useStoreQuery } from "~Storage"

export const useConditionalNavigation = () => {
    const nav = useNavigation()

    //todo: replace when realm is updated
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    const navigate = useCallback(
        (route1: Routes, route2: Routes) => {
            if (devices.length) {
                nav.navigate(route1)
            } else {
                nav.navigate(route2)
            }
        },
        [devices.length, nav],
    )

    return navigate
}
