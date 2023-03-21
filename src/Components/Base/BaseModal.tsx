import React from "react"
import { Modal, SafeAreaView, StyleSheet } from "react-native"
import { BaseView } from "./BaseView"

export interface IBaseModal {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    hasSafeArea?: boolean
}
export const BaseModal: React.FC<IBaseModal> = ({
    isOpen,
    onClose,
    children,
    hasSafeArea = true,
}) => {
    return (
        <Modal
            animationType="slide"
            visible={isOpen}
            hardwareAccelerated
            presentationStyle="fullScreen"
            onDismiss={onClose}
            onRequestClose={onClose}>
            {hasSafeArea ? (
                <SafeAreaView style={safeAreaViewStyles.flex}>
                    <BaseView
                        alignItems="center"
                        justifyContent="flex-start"
                        flexGrow={1}>
                        {children}
                    </BaseView>
                </SafeAreaView>
            ) : (
                <BaseView
                    alignItems="center"
                    justifyContent="flex-start"
                    flexGrow={1}>
                    {children}
                </BaseView>
            )}
        </Modal>
    )
}

const safeAreaViewStyles = StyleSheet.create({
    flex: { flex: 1 },
})
