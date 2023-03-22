import React from "react"
import { Modal, SafeAreaView } from "react-native"
import { BaseSafeArea } from "./BaseSafeArea"
import { BaseView } from "./BaseView"

export interface IBaseModal {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export const BaseModal: React.FC<IBaseModal> = ({
    isOpen,
    onClose,
    children,
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isOpen}
            hardwareAccelerated
            presentationStyle="fullScreen"
            onDismiss={onClose}
            onRequestClose={onClose}>
            <BaseSafeArea grow={1}>
                <SafeAreaView />
                <BaseView
                    alignItems="center"
                    justifyContent="flex-start"
                    flexGrow={1}>
                    {children}
                </BaseView>
            </BaseSafeArea>
        </Modal>
    )
}
