import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon } from "~Components"
import { COLORS } from "~Constants"
import { useDisclosure, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectBlackListedAddresses, useAppSelector } from "~Storage/Redux"
import { CollectionsList } from "./CollectionsList"

export const BlacklistedCollectionsList = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { isOpen, onToggle } = useDisclosure(false)
    const blackListedCollections = useAppSelector(selectBlackListedAddresses)

    if (blackListedCollections.length === 0) return null

    return (
        <>
            <BaseButton
                action={onToggle}
                style={styles.button}
                typographyFont="captionSemiBold"
                textColor={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                rightIcon={
                    <BaseIcon
                        name={isOpen ? "icon-chevron-up" : "icon-eye-off"}
                        color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                        style={styles.icon}
                    />
                }
                radius={6}
                bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200}
                px={12}
                py={8}>
                {isOpen ? LL.COLLECTIONS_HIDE_BACK() : LL.COLLECTIONS_VIEW_HIDDEN()}
            </BaseButton>
            {isOpen && <CollectionsList data={blackListedCollections} nested style={styles.list} />}
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        button: { marginTop: 32, width: "auto", alignSelf: "flex-start" },
        icon: { marginLeft: 8 },
        list: { marginTop: 16 },
    })
