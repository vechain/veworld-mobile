import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { Dispatch, PropsWithChildren, RefObject, SetStateAction, useContext, useMemo, useState } from "react"
import { useBottomSheetModal } from "~Hooks"
import { CertificateRequest, ConnectAppRequest } from "~Model"

type ContextType = {
    connectBsRef: RefObject<BottomSheetModalMethods>
    certificateBsRef: RefObject<BottomSheetModalMethods>
    connectBsData: ConnectAppRequest | null
    setConnectBsData: Dispatch<SetStateAction<ConnectAppRequest | null>>
    certificateBsData: CertificateRequest | null
    setCertificateBsData: Dispatch<SetStateAction<CertificateRequest | null>>
}

const Context = React.createContext<ContextType | undefined>(undefined)

export const InteractionProvider = ({ children }: PropsWithChildren) => {
    const { ref: connectBsRef } = useBottomSheetModal()
    const { ref: certificateBsRef } = useBottomSheetModal()
    const [connectBsData, setConnectBsData] = useState<ConnectAppRequest | null>(null)
    const [certificateBsData, setCertificateBsData] = useState<CertificateRequest | null>(null)
    const contextValue = useMemo(
        () => ({
            connectBsRef,
            connectBsData,
            setConnectBsData,
            certificateBsRef,
            certificateBsData,
            setCertificateBsData,
        }),
        [connectBsRef, connectBsData, certificateBsRef, certificateBsData],
    )

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export const useInteraction = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useInteraction must be used within a InteractionProvider")
    }

    return context
}
