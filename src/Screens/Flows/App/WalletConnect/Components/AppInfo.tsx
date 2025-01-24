import React from "react"
import { BaseSpacer, BaseText, BaseView, CompressAndExpandBaseText } from "~Components"
import { Image, StyleSheet } from "react-native"

type Props = {
    name: string
    description?: string
    url: string
    icon?: string | object
    hanldeOnReadMore?: (isDescriptionExpanded: boolean) => void
}

export const AppInfo = ({ name, description, url, icon, hanldeOnReadMore }: Props) => {
    return (
        <BaseView>
            {icon ? (
                <>
                    <Image style={styles.dappLogo} source={typeof icon === "string" ? { uri: icon } : icon} />
                    <BaseSpacer height={16} />
                </>
            ) : (
                <BaseSpacer height={20} />
            )}

            <BaseText typographyFont="subTitleBold">{name}</BaseText>

            <BaseSpacer height={8} />

            {description && (
                <>
                    <CompressAndExpandBaseText
                        text={description}
                        numberOfLines={2}
                        typographyFont="bodyMedium"
                        onReadMore={hanldeOnReadMore}
                    />
                    <BaseSpacer height={8} />
                </>
            )}

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
