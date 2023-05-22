import React from "react"
import { ActivityIndicator } from "react-native"
import { BaseModal } from "../BaseModal"
import { BaseView } from "../BaseView"
import { BaseText } from "../BaseText"

type Props = {
    text?: string
    isVisible: boolean
    onHide: () => void
}
export const BaseActivityIndicator: React.FC<Props> = ({
    text,
    isVisible,
    onHide,
}) => {
    return (
        <BaseModal
            isOpen={isVisible}
            onClose={onHide}
            transparent={true}
            presentationStyle="overFullScreen">
            <BaseView flex={1} alignItems="center" justifyContent="center">
                <ActivityIndicator size="large" />
                {text && <BaseText>{text}</BaseText>}
            </BaseView>
        </BaseModal>
    )
}
