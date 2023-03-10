import { Driver, SimpleNet } from "@vechain/connex-driver"
import { newThor } from "@vechain/connex-framework/dist/thor"
import { useCallback } from "react"

export const useThor = () => {
    const driver = useCallback(async (url: string) => {
        const currentDriver = await Driver.connect(new SimpleNet(url))
        return newThor(currentDriver)
    }, [])

    return driver
}
