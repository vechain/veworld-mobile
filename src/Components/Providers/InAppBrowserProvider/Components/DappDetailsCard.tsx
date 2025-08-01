import { default as React, useMemo, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseText } from "~Components"
import { BaseSpacer } from "~Components/Base/BaseSpacer"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { NETWORK_TYPE } from "~Model"
import { selectFeaturedDapps, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { DappDetails } from "./DappDetails"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseSpacer = Animated.createAnimatedComponent(wrapFunctionComponent(BaseSpacer))

type Props = {
    /**
     * Url of the app from the request
     */
    appUrl: string
    /**
     * Name of the app from the request
     */
    appName: string
    /**
     * Show warning if the URL is not of a dapp. Defaults to true
     */
    showDappWarning?: boolean
    /**
     * True if the details should be visible by default, false otherwise. Defaults to false
     */
    isDefaultVisible?: boolean
    /**
     * Show spacer before the children.
     * @default true
     */
    showSpacer?: boolean
    children: (props: { visible: boolean }) => React.ReactNode
    onShowDetails?: (newValue: boolean) => void
}

export const DappDetailsCard = ({
    appName,
    appUrl,
    children,
    showDappWarning = true,
    isDefaultVisible = false,
    showSpacer = true,
    onShowDetails,
}: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)
    const [showDetails, setShowDetails] = useState(isDefaultVisible)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const allApps = useAppSelector(selectFeaturedDapps)

    const spacerStyles = useAnimatedStyle(() => {
        return {
            opacity: showDetails ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
            height: showDetails ? 16 : 0,
        }
    }, [showDetails])

    const { icon, name, url, isDapp } = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(appUrl).origin)
        if (foundDapp)
            return {
                icon: foundDapp.id
                    ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                    : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                name: foundDapp.name,
                url: appUrl,
                isDapp: true,
            }

        return {
            name: appName,
            url: appUrl,
            icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(appUrl).origin}`,
            isDapp: selectedNetwork.type !== NETWORK_TYPE.MAIN,
        }
    }, [allApps, appName, appUrl, selectedNetwork.type])

    return (
        <AnimatedBaseView
            bg={theme.isDark ? COLORS.PURPLE : COLORS.WHITE}
            p={16}
            flexDirection="column"
            layout={LinearTransition.duration(300)}
            borderRadius={12}>
            <AnimatedBaseView flexDirection="row" gap={12} layout={LinearTransition.duration(300)}>
                <BaseView flexDirection="row" gap={16} flex={1}>
                    <Image
                        source={
                            loadFallback
                                ? require("~Assets/Img/dapp-fallback.png")
                                : {
                                      uri: icon,
                                  }
                        }
                        style={[{ height: 48, width: 48 }, styles.icon] as StyleProp<ImageStyle>}
                        onError={() => setLoadFallback(true)}
                        resizeMode="contain"
                    />
                    <BaseView flexDirection="column" gap={2} flex={1}>
                        <BaseText
                            typographyFont="bodyMedium"
                            numberOfLines={1}
                            color={theme.colors.assetDetailsCard.title}
                            testID="DAPP_WITH_DETAILS_NAME">
                            {name}
                        </BaseText>
                        <BaseText
                            typographyFont="captionMedium"
                            numberOfLines={1}
                            color={theme.colors.assetDetailsCard.text}
                            testID="DAPP_WITH_DETAILS_URL">
                            {url}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseButton
                    action={() => {
                        setShowDetails(old => !old)
                        onShowDetails?.(!showDetails)
                    }}
                    variant="ghost"
                    textColor={theme.isDark ? COLORS.GREY_100 : COLORS.PRIMARY_800}
                    typographyFont="bodyMedium"
                    px={0}
                    rightIcon={
                        <BaseIcon
                            name={showDetails ? "icon-chevron-up" : "icon-chevron-down"}
                            size={12}
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.PRIMARY_800}
                            style={styles.rightIcon}
                        />
                    }
                    testID="DAPP_WITH_DETAILS_DETAILS_BTN">
                    {showDetails ? LL.HIDE() : LL.DETAILS()}
                </BaseButton>
            </AnimatedBaseView>
            {!isDapp && showDappWarning && (
                <>
                    <BaseSpacer height={16} />
                    <DappDetails.NotVerifiedWarning />
                </>
            )}
            {showSpacer && <AnimatedBaseSpacer style={[spacerStyles]} />}

            {children({ visible: showDetails })}
        </AnimatedBaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        rightIcon: {
            marginLeft: 2,
        },
    })
