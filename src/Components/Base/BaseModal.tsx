import React from "react"
import { Modal, ModalProps } from "react-native"
import { BaseSafeArea } from "./BaseSafeArea/BaseSafeArea"
import { BaseView } from "./BaseView"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Hooks"
export interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export const BaseModal: React.FC<IBaseModal> = ({ isOpen, onClose, children, transparent = false, ...otherProps }) => {
    const theme = useTheme()
    return (
        <SafeAreaProvider>
            <BaseSafeArea bg={transparent ? "transparent" : undefined} grow={1}>
                <Modal
                    visible={isOpen}
                    animationType="slide"
                    transparent={transparent}
                    hardwareAccelerated
                    presentationStyle="fullScreen"
                    onDismiss={onClose}
                    onRequestClose={onClose}
                    {...otherProps}>
                    <BaseView alignItems="center" justifyContent="flex-start" bg={theme.colors.background}>
                        {children}
                    </BaseView>
                </Modal>
            </BaseSafeArea>
        </SafeAreaProvider>
    )
}
