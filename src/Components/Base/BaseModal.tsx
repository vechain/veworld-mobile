import React from "react"
import { Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
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
        <>
            <Modal
                visible={isOpen}
                animationType="slide"
                transparent={false}
                hardwareAccelerated
                presentationStyle="fullScreen"
                onDismiss={onClose}
                onRequestClose={onClose}>
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
