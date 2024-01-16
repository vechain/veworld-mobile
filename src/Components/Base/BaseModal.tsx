import React from "react"
import { Modal, ModalProps } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BaseSafeArea } from "./BaseSafeArea"
import { BaseView } from "./BaseView"

export interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export const BaseModal: React.FC<IBaseModal> = ({
    isOpen,
    onClose,
    children,
    ...otherProps
}) => {
    return (
        <>
            <Modal
                visible={isOpen}
                animationType="slide"
                transparent={false}
                hardwareAccelerated
                presentationStyle="fullScreen"
                onDismiss={onClose}
                onRequestClose={onClose}
                {...otherProps}>
                <BaseSafeArea grow={1}>
                    <SafeAreaView style={{ flex: 1 }} />
                    <BaseView
                        alignItems="center"
                        justifyContent="flex-start"
                        flexGrow={1}>
                        {children}
                    </BaseView>
                </BaseSafeArea>
            </Modal>
        </>
    )
}
