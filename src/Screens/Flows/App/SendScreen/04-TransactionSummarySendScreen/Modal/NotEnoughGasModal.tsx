import React, { useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet, View, ViewProps } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import Animated, { AnimatedProps, FadeInRight, FadeOut } from "react-native-reanimated"

type Props = {
    isVisible: boolean
    isDelegation?: boolean
}

interface INotEnoughGasMessage extends AnimatedProps<ViewProps> {
    isDelegation?: boolean
}

function NotEnoughGasMessage(props: INotEnoughGasMessage) {
    const { ...animatedViewProps } = props
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <Animated.View {...animatedViewProps}>
            <BaseView flexDirection="column">
                <BaseView flexDirection="row" alignItems="center">
                    <BaseIcon
                        name="alert-circle-outline"
                        color={props.isDelegation ? theme.colors.success : theme.colors.danger}
                        size={20}
                    />
                    <BaseSpacer width={6} />
                    <BaseText
                        typographyFont="buttonSecondary"
                        color={props.isDelegation ? theme.colors.success : theme.colors.danger}>
                        {LL.SEND_ACCEPT_NO_GAS_TITLE()}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={16} />
                <BaseText>{LL.SEND_ACCEPT_NO_GAS_MESSAGE()}</BaseText>
            </BaseView>
        </Animated.View>
    )
}

export const NotEnoughGasModal: React.FC<Props> = ({ isVisible, isDelegation }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    useEffect(() => {
        setModalVisible(isVisible)
    }, [isVisible])

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible)
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <NotEnoughGasMessage
                            entering={FadeInRight.springify(300).mass(1)}
                            exiting={FadeOut.springify(300).mass(1)}
                            isDelegation={isDelegation}
                        />
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <BaseText style={styles.textStyle}>{LL.SEND_ACCEPT_NO_GAS_WARNING()}</BaseText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 22,
        },
        modalView: {
            flexDirection: "column",
            justifyContent: "space-between",
            width: "80%",
            height: 190,
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
            backgroundColor: theme.colors.placeholder,
        },
        button: {
            borderRadius: 20,
            padding: 10,
            elevation: 2,
            width: "80%",
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
