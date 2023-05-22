import React from "react"
import { Modal, ModalProps } from "react-native"
import { BaseSafeArea } from "./BaseSafeArea"
import { BaseView } from "./BaseView"
import { BaseSpacer } from "./BaseSpacer"

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
                    <BaseSpacer height={40} />
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
