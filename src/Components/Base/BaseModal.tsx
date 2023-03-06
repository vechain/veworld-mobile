import React from "react"
import { Modal } from "react-native"
import { PlatformUtils } from "~Common"
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
            hardwareAccelerated
            presentationStyle="fullScreen"
            onDismiss={onClose}
            onRequestClose={onClose}>
            <BaseSafeArea grow={1}>
                {PlatformUtils.isIOS() && <BaseSpacer height={60} />}
                <BaseView align="center" justify="flex-start" grow={1}>
                    {children}
                </BaseView>
            </BaseSafeArea>
        </Modal>
    )
}
