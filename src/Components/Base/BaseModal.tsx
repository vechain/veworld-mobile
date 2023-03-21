import React from "react"
import { Modal, SafeAreaView, StyleSheet } from "react-native"
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
            <SafeAreaView style={safeAreaViewStyles.flex}>
                <BaseView
                    alignItems="center"
                    justifyContent="flex-start"
                    flexGrow={1}>
                    {children}
                </BaseView>
            </SafeAreaView>
        </Modal>
    )
}

const safeAreaViewStyles = StyleSheet.create({
    flex: { flex: 1 },
})
