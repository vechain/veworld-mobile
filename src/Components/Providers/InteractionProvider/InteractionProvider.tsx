import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { Dispatch, PropsWithChildren, RefObject, SetStateAction, useContext, useMemo, useState } from "react"
import { useBottomSheetModal } from "~Hooks"
import {
    CertificateRequest,
    ConnectAppRequest,
    DisconnectAppRequest,
    TransactionRequest,
    TypeDataRequest,
} from "~Model"

type ContextType = {
    connectBsRef: RefObject<BottomSheetModalMethods>
    certificateBsRef: RefObject<BottomSheetModalMethods>
    transactionBsRef: RefObject<BottomSheetModalMethods>
    typedDataBsRef: RefObject<BottomSheetModalMethods>
    disconnectBsRef: RefObject<BottomSheetModalMethods>
    connectBsData: ConnectAppRequest | null
    setConnectBsData: Dispatch<SetStateAction<ConnectAppRequest | null>>
    certificateBsData: CertificateRequest | null
    setCertificateBsData: Dispatch<SetStateAction<CertificateRequest | null>>
    transactionBsData: TransactionRequest | null
    setTransactionBsData: Dispatch<SetStateAction<TransactionRequest | null>>
    typedDataBsData: TypeDataRequest | null
    setTypedDataBsData: Dispatch<SetStateAction<TypeDataRequest | null>>
    disconnectBsData: DisconnectAppRequest | null
    setDisconnectBsData: Dispatch<SetStateAction<DisconnectAppRequest | null>>
}

const Context = React.createContext<ContextType | undefined>(undefined)

export const InteractionProvider = ({ children }: PropsWithChildren) => {
    const { ref: connectBsRef } = useBottomSheetModal()
    const { ref: certificateBsRef } = useBottomSheetModal()
    const { ref: transactionBsRef } = useBottomSheetModal()
    const { ref: typedDataBsRef } = useBottomSheetModal()
    const { ref: disconnectBsRef } = useBottomSheetModal()
    const [connectBsData, setConnectBsData] = useState<ConnectAppRequest | null>(null)
    const [disconnectBsData, setDisconnectBsData] = useState<DisconnectAppRequest | null>(null)
    const [certificateBsData, setCertificateBsData] = useState<CertificateRequest | null>(null)
    const [transactionBsData, setTransactionBsData] = useState<TransactionRequest | null>(null)
    const [typedDataBsData, setTypedDataBsData] = useState<TypeDataRequest | null>(null)
    const contextValue = useMemo(
        () => ({
            connectBsRef,
            connectBsData,
            disconnectBsRef,
            disconnectBsData,
            setDisconnectBsData,
            setConnectBsData,
            certificateBsRef,
            certificateBsData,
            setCertificateBsData,
            transactionBsRef,
            transactionBsData,
            setTransactionBsData,
            typedDataBsRef,
            typedDataBsData,
            setTypedDataBsData,
        }),
        [
            connectBsRef,
            connectBsData,
            disconnectBsRef,
            disconnectBsData,
            certificateBsRef,
            certificateBsData,
            transactionBsRef,
            transactionBsData,
            typedDataBsRef,
            typedDataBsData,
        ],
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
