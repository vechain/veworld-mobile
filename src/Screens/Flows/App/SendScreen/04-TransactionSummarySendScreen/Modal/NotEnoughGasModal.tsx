import React, { useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet } from "react-native"
import { AlertCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type NotEnoughGasModalProps = {
    isVisible: boolean
}

export const NotEnoughGasModal: React.FC<NotEnoughGasModalProps> = ({ isVisible }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    useEffect(() => {
        setModalVisible(isVisible)
    }, [isVisible])

    return (
        <BaseView style={styles.centeredView}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible)
                }}>
                <BaseView style={styles.centeredView}>
                    <BaseView px={20} style={styles.modalView}>
                        <AlertCard
                            title={LL.SEND_ACCEPT_NO_GAS_TITLE()}
                            message={LL.SEND_ACCEPT_NO_GAS_MESSAGE()}
                            status="error"
                        />
                        <BaseSpacer height={12} />
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <BaseText typographyFont="buttonMedium" color={theme.colors.button}>
                                {LL.SEND_ACCEPT_NO_GAS_ACCEPT()}
                            </BaseText>
                        </Pressable>
                    </BaseView>
                </BaseView>
            </Modal>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)", // Add this line
        },
        modalView: {
            flexDirection: "column",
            justifyContent: "space-between",
            width: "85%",
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: theme.colors.card,
        },
        button: {
            borderRadius: 8,
            alignItems: "center",
            padding: 14,
            elevation: 2,
        },
        buttonClose: {
            borderWidth: 1,
            borderColor: theme.colors.button,
        },
    })
