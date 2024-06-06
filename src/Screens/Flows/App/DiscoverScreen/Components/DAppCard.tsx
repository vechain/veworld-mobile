import React, { memo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { DiscoveryDApp } from "~Constants"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { DAppIcon } from "./DAppIcon"
import { getAppHubIconUrl } from "../utils"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"

type Props = {
    dapp: DiscoveryDApp
    onPress: (dapp: DiscoveryDApp) => void
}

export const DAppCard: React.FC<Props> = memo(({ onPress, dapp }: Props) => {
    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut} style={[baseStyles.container]}>
            <TouchableOpacity onPress={() => onPress(dapp)}>
                <DAppIcon
                    imageSource={{
                        uri: dapp.id
                            ? getAppHubIconUrl(dapp.id)
                            : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                    }}
                />

                <BaseView justifyContent="center" alignItems="center">
                    <BaseSpacer height={8} />
                    <BaseText ellipsizeMode="tail" numberOfLines={1} fontSize={10}>
                        {dapp.name}
                    </BaseText>
                </BaseView>
            </TouchableOpacity>
        </Animated.View>
    )
})

const baseStyles = StyleSheet.create({
    container: {
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "25%",
    },
})
