import React from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    CompressAndExpandBaseText,
} from "~Components"
import { StyleSheet, Image } from "react-native"

type Props = {
    name: string
    description: string
    url: string
    icon: string
    hanldeOnReadMore?: (isDescriptionExpanded: boolean) => void
}

export const AppInfo = ({
    name,
    description,
    url,
    icon,
    hanldeOnReadMore,
}: Props) => {
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
            <CompressAndExpandBaseText
                text={description}
                numberOfLines={2}
                typographyFont="bodyMedium"
                onReadMore={hanldeOnReadMore}
            />
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
