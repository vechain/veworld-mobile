import React, { memo } from "react"
import { Modal, ModalProps } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { COLORS } from "~Constants"

interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    transparent?: boolean
    hasBackButton?: boolean
}

export const BaseModalWithChildren: React.FC<IBaseModal> = memo(
    ({ isOpen, onClose, transparent, hasBackButton = true, children }) => {
        return (
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                transparent={transparent}
                style={{ backgroundColor: COLORS.LIGHT_GRAY }}>
                <BaseView justifyContent="flex-start" py={transparent ? 0 : 62} bg={COLORS.LIGHT_GRAY}>
                    {hasBackButton && (
                        <BaseIcon
                            haptics="Light"
                            px={12}
                            size={36}
                            name="chevron-left"
                            action={onClose}
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={{
                                alignSelf: "flex-start",
                            }}
                        />
                    )}
                    {children}
                </BaseView>
            </BaseModal>
        )
    },
)

const BaseModal: React.FC<IBaseModal> = ({ isOpen, onClose, children, transparent = false, ...otherProps }) => {
    return (
        <Modal
            visible={isOpen}
            animationType={transparent ? "fade" : "slide"}
            transparent={transparent}
            hardwareAccelerated
            presentationStyle={transparent ? "overFullScreen" : "fullScreen"}
            onDismiss={onClose}
            onRequestClose={onClose}
            style={{ backgroundColor: COLORS.LIGHT_GRAY }}
            {...otherProps}>
            {children}
        </Modal>
    )
}
