import React, { memo } from "react"
import { Modal, ModalProps } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"

interface IBaseModal extends ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    transparent?: boolean
    hasBackButton?: boolean
}

export const BaseModalWithChildren: React.FC<IBaseModal> = memo(
    ({ isOpen, onClose, transparent, hasBackButton = true, children }) => {
        const theme = useTheme()

        return (
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                transparent={transparent}
                style={{ backgroundColor: theme.colors.background }}>
                <BaseView justifyContent="flex-start" py={transparent ? 0 : 62} bg={theme.colors.background}>
                    {hasBackButton && (
                        <BaseIcon
                            color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE}
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
    const theme = useTheme()
    return (
        <Modal
            visible={isOpen}
            animationType={transparent ? "fade" : "slide"}
            transparent={transparent}
            hardwareAccelerated
            presentationStyle={transparent ? "overFullScreen" : "fullScreen"}
            onDismiss={onClose}
            onRequestClose={onClose}
            style={{ backgroundColor: theme.colors.background }}
            {...otherProps}>
            {children}
        </Modal>
    )
}
