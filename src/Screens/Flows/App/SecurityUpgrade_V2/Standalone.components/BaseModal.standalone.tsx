import React, { memo, useMemo } from "react"
import { Modal, ModalProps } from "react-native"
import { BaseView } from "~Components"
import { isSmallScreen } from "~Constants"
import { useTheme } from "~Hooks"

interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    transparent?: boolean
    hasBackButton?: boolean
}

export const BaseModalWithChildren: React.FC<IBaseModal> = memo(({ isOpen, onClose, transparent = true, children }) => {
    const theme = useTheme()
    const calculatedPY = useMemo(() => {
        if (transparent) return 0
        if (isSmallScreen) return 8
        return 48
    }, [transparent])
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            transparent={transparent}
            style={{ backgroundColor: theme.colors.background }}>
            <BaseView justifyContent="flex-start" py={calculatedPY} bg={theme.colors.background}>
                {children}
            </BaseView>
        </BaseModal>
    )
})

const BaseModal: React.FC<IBaseModal> = ({ isOpen, onClose, children, transparent = false, ...otherProps }) => {
    const theme = useTheme()
    return (
        <Modal
            visible={isOpen}
            animationType={transparent ? "fade" : "slide"}
            transparent={transparent}
            hardwareAccelerated
            presentationStyle={transparent ? "overFullScreen" : "fullScreen"}
            onDismiss={onClose}
            onRequestClose={onClose}
            style={{ backgroundColor: theme.colors.background }}
            {...otherProps}>
            {children}
        </Modal>
    )
}
