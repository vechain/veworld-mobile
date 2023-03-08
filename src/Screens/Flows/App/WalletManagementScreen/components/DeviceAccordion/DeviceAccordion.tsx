import { FlashList } from "@shopify/flash-list"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"

import { ColorThemeType, useThemedStyles } from "~Common"
import { useAccountsList } from "~Common/Hooks/Entities"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    BaseAccordion,
} from "~Components"
import { Device } from "~Storage"
import { AccountWithBalanceBox } from "./AccountWithBalanceBox"

type Props = {
    device: Device
}

export const DeviceAccordion: React.FC<Props> = ({ device }) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    const accounts = useAccountsList()
    const headerComponent = useMemo(() => {
        return (
            <BaseView style={themedStyles.headerComponent}>
                <BaseText typographyFont="subTitle">{device.alias}</BaseText>
                <BaseIcon
                    name={"pencil-outline"}
                    color={theme.colors.text}
                    size={24}
                    action={() => {}}
                    disabled
                />
            </BaseView>
        )
    }, [themedStyles, theme, device])

    console.log(accounts.length)

    const bodyComponent = useMemo(() => {
        const renderSeparator = () => <BaseSpacer height={2} />
        return (
            <FlashList
                data={accounts}
                keyExtractor={account => account.address}
                ItemSeparatorComponent={renderSeparator}
                // contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => {
                    return <AccountWithBalanceBox account={item} />
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={accounts.length}
                // estimatedListSize={{
                //     height: 184,
                //     width: 152 * accounts.length + (accounts.length - 1) * 16,
                // }}
            />
        )
    }, [accounts])

    return (
        <BaseAccordion
            headerComponent={headerComponent}
            headerStyle={themedStyles.headerContainer}
            headerOpenedStyle={themedStyles.openedHeaderContainer}
            headerClosedStyle={themedStyles.closedHeaderContainer}
            bodyComponent={bodyComponent}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        headerContainer: {
            width: "100%",
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 13,
            backgroundColor: theme.colors.card,
        },
        openedHeaderContainer: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        closedHeaderContainer: {
            borderRadius: 16,
        },
        headerComponent: {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flex: 0.95,
        },
        bodyContainer: { width: "100%", overflow: "hidden" },
        bodyContent: { width: "100%" },
    })
