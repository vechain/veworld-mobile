import React, { memo, useCallback, useState } from "react"
import { LayoutChangeEvent, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useDappBookmarking, useThemedStyles } from "~Hooks"
import { DiscoveryDApp } from "~Constants"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseTouchableBox, BaseView } from "~Components"
import { DAppIcon } from "./DAppIcon"
import { getAppHubIconUrl } from "../utils"
import { useI18nContext } from "~i18n"

type Props = {
    dapp: DiscoveryDApp
    onPress: (dapp: DiscoveryDApp) => void
    containerStyle?: StyleProp<ViewStyle>
}

const MAX_NUMBER_OF_LINES = 2
const DESCRIPTION_FONT_SIZE = 12

export const DAppCard: React.FC<Props> = memo(({ onPress, dapp, containerStyle }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.href, dapp?.name)

    const [isMoreLabelVisible, setIsMoreLabelVisible] = useState<boolean>(false)
    const [showAllLines, setShowAllLines] = useState<boolean>(false)

    const numberOfLines = showAllLines ? undefined : MAX_NUMBER_OF_LINES
    const showLabel = !showAllLines ? LL.DISCOVER_DAPP_CARD_SHOW_MORE() : LL.DISCOVER_DAPP_CARD_SHOW_LESS()

    const showMoewHandler = useCallback(() => {
        setShowAllLines(prev => !prev)
    }, [setShowAllLines])

    const onLayoutHandler = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout

        if (height > DESCRIPTION_FONT_SIZE * MAX_NUMBER_OF_LINES) {
            setIsMoreLabelVisible(true)
        }
    }, [])

    return (
        <BaseView flexDirection="row" style={containerStyle}>
            <BaseTouchableBox
                haptics="Light"
                action={() => onPress(dapp)}
                justifyContent="space-between"
                containerStyle={styles.container}>
                <BaseView flexDirection="row" flex={1} pr={10}>
                    <DAppIcon
                        imageSource={{
                            uri: dapp.id
                                ? getAppHubIconUrl(dapp.id)
                                : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                        }}
                    />
                    <BaseSpacer width={12} />
                    <BaseView flex={1}>
                        <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.nameText}>
                            {dapp.name}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText
                            onLayout={onLayoutHandler}
                            ellipsizeMode="tail"
                            numberOfLines={numberOfLines}
                            style={{ fontSize: DESCRIPTION_FONT_SIZE }}>
                            {dapp.desc ? dapp.desc : dapp.href}
                        </BaseText>

                        {isMoreLabelVisible && (
                            <BaseView flexDirection="row-reverse">
                                <BaseTouchable
                                    style={styles.showLabel}
                                    title={showLabel}
                                    underlined
                                    action={showMoewHandler}
                                    font="caption"
                                />
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseTouchableBox>
            <BaseSpacer width={12} />
            <BaseIcon
                onPress={toggleBookmark}
                name={isBookMarked ? "bookmark" : "bookmark-outline"}
                color={theme.colors.text}
                size={24}
            />
        </BaseView>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        showLabel: {
            padding: 4,
        },
    })
