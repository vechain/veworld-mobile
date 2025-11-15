import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react"

const AccordionContext = createContext<{ open: boolean; setOpen: (newValue: boolean) => void }>({
    open: false,
    setOpen: () => {},
})

export const useBaseAccordionV2 = () => useContext(AccordionContext)

export const BaseAccordionV2Provider = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false)
    const ctxProps = useMemo(() => ({ open, setOpen }), [open, setOpen])

    return <AccordionContext.Provider value={ctxProps}>{children}</AccordionContext.Provider>
}
