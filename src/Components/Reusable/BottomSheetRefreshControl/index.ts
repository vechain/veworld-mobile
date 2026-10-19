import type React from "react"
import type { RefreshControlProps } from "react-native"
import BottomSheetRefreshControl from "./BottomSheetRefreshControl"

export default BottomSheetRefreshControl as any as React.MemoExoticComponent<
    React.ForwardRefExoticComponent<
        RefreshControlProps & {
            children: React.ReactNode | React.ReactNode[]
        } & React.RefAttributes<React.ComponentType | undefined | null>
    >
>
