import { default as React, useMemo, useState } from "react"
import { Image, ImageStyle, LayoutAnimation, StyleProp, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText } from "~Components"
import { BaseSpacer } from "~Components/Base/BaseSpacer"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useI18nContext } from "~i18n"
import { NETWORK_TYPE } from "~Model"
import { selectFeaturedDapps, selectSelectedAccountOrNull, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AccountUtils, DAppUtils } from "~Utils"
import { DappDetails } from "./DappDetails"

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
     * Show warning if the account is a watched account. This will override the showDappWarning if true.
     * @default true
     */
    showIsWatchedAccountWarning?: boolean
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
    /**
     * True if the `Details` button should be renderer, false otherwise.
     * @default true
     */
    renderDetailsButton?: boolean
}

export const DappDetailsCard = ({
    appName,
    appUrl,
    children,
    showDappWarning = true,
    showIsWatchedAccountWarning = true,
    isDefaultVisible = false,
    showSpacer = true,
    onShowDetails,
    renderDetailsButton = true,
}: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)
    const [showDetails, setShowDetails] = useState(isDefaultVisible)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const allApps = useAppSelector(selectFeaturedDapps)

    const fetchDynamicAppLogo = useDynamicAppLogo({ size: 64 })
    const configureDetailsAnimation = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.scaleXY,
            },
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
            },
            delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.scaleXY,
            },
        })
    }

    const { icon, name, url, isDapp } = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(appUrl).origin)
        if (foundDapp)
            return {
                icon: fetchDynamicAppLogo({ app: foundDapp }),
                name: foundDapp.name,
                url: appUrl,
                isDapp: true,
            }

        return {
            name: appName,
            url: appUrl,
            icon: DAppUtils.generateFaviconUrl(appUrl, { size: 64 }),
            isDapp: selectedNetwork.type !== NETWORK_TYPE.MAIN,
        }
    }, [allApps, appName, appUrl, fetchDynamicAppLogo, selectedNetwork.type])

    const isWatchedAccount = useMemo(() => {
        return AccountUtils.isObservedAccount(selectedAccount)
    }, [selectedAccount])

    return (
        <BaseView bg={theme.isDark ? COLORS.PURPLE : COLORS.WHITE} p={16} flexDirection="column" borderRadius={12}>
            <BaseView flexDirection="row" gap={12}>
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
                {renderDetailsButton && (
                    <BaseButton
                        action={() => {
                            configureDetailsAnimation()
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
                )}
            </BaseView>
            {showIsWatchedAccountWarning && isWatchedAccount && (
                <>
                    <BaseSpacer height={16} />
                    <DappDetails.NotVerifiedWatchedAccountWarning />
                </>
            )}
            {!isDapp && showDappWarning && !isWatchedAccount && (
                <>
                    <BaseSpacer height={16} />
                    <DappDetails.NotVerifiedWarning />
                </>
            )}
            {showSpacer && showDetails && <BaseSpacer height={16} />}

            {children({ visible: showDetails })}
        </BaseView>
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
