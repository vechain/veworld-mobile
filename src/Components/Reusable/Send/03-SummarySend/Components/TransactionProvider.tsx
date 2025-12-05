import React, { createContext, PropsWithChildren, useContext } from "react"
import { useTransactionScreen } from "~Hooks"

type Props = ReturnType<typeof useTransactionScreen>

const TransactionContext = createContext<Props | null>(null)

export const TransactionProvider = ({ children, ...props }: PropsWithChildren<Props>) => {
    return <TransactionContext.Provider value={props}>{children}</TransactionContext.Provider>
}

export const useTransactionContext = () => {
    const context = useContext(TransactionContext)
    if (!context) {
        throw new Error("useTransactionContext must be used within a TransactionProvider")
    }
    return context
}
