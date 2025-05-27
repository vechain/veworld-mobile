import React from "react"
import { Modal, ModalProps, StyleSheet } from "react-native"
import { BaseView } from "./BaseView"
import { useThemedStyles } from "~Hooks"
import { SafeAreaView } from "react-native-safe-area-context"

export interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export const BaseModal: React.FC<IBaseModal> = ({ isOpen, onClose, children, transparent = false, ...otherProps }) => {
    const { styles, theme } = useThemedStyles(baseStyles(transparent))
    return (
        <SafeAreaView style={styles.container}>
            <Modal
                visible={isOpen}
                animationType="slide"
                hardwareAccelerated
                presentationStyle="fullScreen"
                onDismiss={onClose}
                transparent={transparent}
                onRequestClose={onClose}
                {...otherProps}>
                <BaseView alignItems="center" justifyContent="flex-start" flex={1} bg={theme.colors.background}>
                    {children}
                </BaseView>
            </Modal>
        </SafeAreaView>
    )
}

const baseStyles = (transparent: boolean) => () =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: transparent ? "transparent" : undefined,
        },
    })
