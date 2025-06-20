import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { PropsWithChildren, RefObject, useContext, useMemo } from "react"
import { useBottomSheetModal } from "~Hooks"

type ContextType = {
    connectBsRef: RefObject<BottomSheetModalMethods>
}

const Context = React.createContext<ContextType | undefined>(undefined)

export const InteractionProvider = ({ children }: PropsWithChildren) => {
    const { ref: connectBsRef } = useBottomSheetModal()
    const contextValue = useMemo(() => ({ connectBsRef }), [connectBsRef])

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export const useInteraction = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useInteraction must be used within a InteractionProvider")
    }

    return context
}
