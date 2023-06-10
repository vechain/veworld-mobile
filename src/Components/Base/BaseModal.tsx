import React from "react"
import { Modal, ModalProps } from "react-native"
import { BaseSafeArea } from "./BaseSafeArea/BaseSafeArea"
import { BaseView } from "./BaseView"
import { SafeAreaProvider } from "react-native-safe-area-context"

export interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export const BaseModal: React.FC<IBaseModal> = ({
    isOpen,
    onClose,
    children,
    transparent = false,
    ...otherProps
}) => {
    return (
        <>
            <Modal
                visible={isOpen}
                animationType="slide"
                transparent={transparent}
                hardwareAccelerated
                presentationStyle="fullScreen"
                onDismiss={onClose}
                onRequestClose={onClose}
                {...otherProps}>
                <SafeAreaProvider>
                    <BaseSafeArea
                        bg={transparent ? "transparent" : undefined}
                        grow={1}>
                        <BaseView
                            alignItems="center"
                            justifyContent="flex-start"
                            flexGrow={1}>
                            {children}
                        </BaseView>
                    </BaseSafeArea>
                </SafeAreaProvider>
            </Modal>
        </>
    )
}
