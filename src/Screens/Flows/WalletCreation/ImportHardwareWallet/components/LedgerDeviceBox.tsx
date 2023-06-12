import React from "react"
import { BaseSpacer, BaseText, BaseTouchableBox } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { ConnectedLedgerDevice } from "~Model"

type Props = {
    device: ConnectedLedgerDevice
    onPress: () => void
    isSelected?: boolean
}

export const LedgerDeviceBox: React.FC<Props> = ({
    device,
    onPress,
    isSelected,
}) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const style = isSelected ? themedStyles.selected : themedStyles.notSelected

    return (
        <BaseTouchableBox
            innerContainerStyle={style}
            action={onPress}
            flexDirection="column"
            alignItems="flex-start">
            <BaseText typographyFont="subSubTitle">{device.localName}</BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="captionRegular">{device.id}</BaseText>
        </BaseTouchableBox>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            backgroundColor: "white ",
        },
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
    })
