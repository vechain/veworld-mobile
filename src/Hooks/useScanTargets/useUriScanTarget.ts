import { useCallback } from "react"
import { Routes } from "~Navigation"
import { useDAppActions } from "~Screens/Flows/App/AppsScreen/Hooks"

export const useUriScanTarget = ({ sourceScreen }: { sourceScreen?: Routes }) => {
    const { onDAppPress } = useDAppActions(sourceScreen)
    return useCallback(
        async (data: string) => {
            return onDAppPress({
                amountOfNavigations: 0,
                createAt: Date.now(),
                href: data,
                isCustom: true,
                name: data,
            })
        },
        [onDAppPress],
    )
}
