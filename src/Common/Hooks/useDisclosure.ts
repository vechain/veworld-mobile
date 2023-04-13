import { useCallback, useState } from "react"

export const useDisclosure = (isDefaultOpen = false) => {
    const [isOpen, setIsOpen] = useState(isDefaultOpen)

    const onOpen = useCallback(() => setIsOpen(true), [])
    const shouldOpen = useCallback((value: boolean) => setIsOpen(value), [])
    const onClose = useCallback(() => setIsOpen(false), [])
    const onToggle = useCallback(() => setIsOpen(prev => !prev), [])

    return { isOpen, onOpen, onClose, onToggle, shouldOpen }
}
