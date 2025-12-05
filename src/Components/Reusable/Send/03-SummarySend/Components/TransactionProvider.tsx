import React, { createContext, PropsWithChildren, useContext } from "react"
import { useTransactionScreen } from "~Hooks"

type Props = ReturnType<typeof useTransactionScreen>

const TransactionContext = createContext<Props>({} as any)

export const TransactionProvider = ({ children, ...props }: PropsWithChildren<Props>) => {
    return <TransactionContext.Provider value={props}>{children}</TransactionContext.Provider>
}

export const useTransactionContext = () => useContext(TransactionContext)
