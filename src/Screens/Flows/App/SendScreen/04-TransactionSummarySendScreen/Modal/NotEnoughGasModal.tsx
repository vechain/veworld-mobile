import React, { useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type NotEnoughGasModalProps = {
    isVisible: boolean
}

function NotEnoughGasMessage() {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <BaseView flexDirection="column">
            <BaseView flexDirection="row" alignItems="center">
                <BaseIcon name="alert-circle-outline" color={theme.colors.danger} size={20} />
                <BaseSpacer width={6} />
                <BaseText typographyFont="buttonSecondary" color={theme.colors.danger}>
                    {LL.SEND_ACCEPT_NO_GAS_TITLE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseText>{LL.SEND_ACCEPT_NO_GAS_MESSAGE()}</BaseText>
        </BaseView>
    )
}

export const NotEnoughGasModal: React.FC<NotEnoughGasModalProps> = ({ isVisible }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const { styles } = useThemedStyles(baseStyles)
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
                    <BaseView style={styles.modalView}>
                        <NotEnoughGasMessage />
                        <BaseSpacer height={18} />
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <BaseText style={styles.textStyle}>{LL.SEND_ACCEPT_NO_GAS_ACCEPT()}</BaseText>
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
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Add this line
        },
        modalView: {
            flexDirection: "column",
            justifyContent: "space-between",
            width: "80%",
            margin: 20,
            borderRadius: 20,
            padding: 15,
            alignItems: "center",
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
            borderRadius: 20,
            padding: 10,
            elevation: 2,
            width: "92%",
        },
        buttonClose: {
            backgroundColor: theme.colors.primary,
        },
        textStyle: {
            color: theme.colors.textReversed,
            fontWeight: "bold",
            textAlign: "center",
        },
    })
