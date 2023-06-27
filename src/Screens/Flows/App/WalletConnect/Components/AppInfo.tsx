import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { StyleSheet, Image } from "react-native"

type Props = {
    name: string
    description: string
    url: string
    icon: string
}

export const AppInfo = ({ name, description, url, icon }: Props) => {
    return (
        <BaseView>
            <Image
                style={styles.dappLogo}
                source={{
                    uri: icon,
                }}
            />
            <BaseSpacer height={16} />
            <BaseText typographyFont="subTitleBold">{name}</BaseText>

            <BaseSpacer height={8} />
            <BaseText typographyFont="bodyMedium">{description}</BaseText>
            <BaseSpacer height={8} />
            <BaseText>{url}</BaseText>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 82,
        height: 82,
        borderRadius: 8,
        marginVertical: 4,
    },
})
