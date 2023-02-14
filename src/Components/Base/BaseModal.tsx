import React from "react"
import { Modal } from "react-native"
import { BaseSafeArea } from "./BaseSafeArea"
import { BaseSpacer } from "./BaseSpacer"
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
            presentationStyle="fullScreen"
            onRequestClose={onClose}>
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />
                <BaseView align="center" justify="flex-start" grow={1} mx={20}>
                    {children}
                </BaseView>
            </BaseSafeArea>
        </Modal>
    )
}
