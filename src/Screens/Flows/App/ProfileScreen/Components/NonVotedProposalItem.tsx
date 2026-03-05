import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { components } from "~Generated/indexer/schema"
import IPFSUtils from "~Utils/IPFSUtils"

type ProposalResult = components["schemas"]["ProposalResult"]

type ProposalEnriched = {
    title?: string
    shortDescription?: string
    markdownDescription?: string
    description?: string
}

type Props = {
    item: ProposalResult
    onPress: (proposalId: string) => void
}

const getDescriptionUri = (description: string) => {
    const trimmed = description.trim()
    if (trimmed.startsWith("ipfs://")) return trimmed
    if (trimmed.startsWith("baf") || trimmed.startsWith("Qm")) return `ipfs://${trimmed}`
    return undefined
}

export const NonVotedProposalItem = ({ item, onPress }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const descriptionUri = useMemo(() => getDescriptionUri(item.description), [item.description])

    const { data: metadata } = useQuery<ProposalEnriched, Error, ProposalEnriched, (string | undefined)[]>({
        ...IPFSUtils.getIpfsQueryKeyOptions<ProposalEnriched>(descriptionUri),
        enabled: !!descriptionUri,
    })

    const descriptionText = useMemo(() => {
        if (!descriptionUri) return item.description
        return (
            metadata?.title ??
            metadata?.shortDescription ??
            metadata?.description ??
            metadata?.markdownDescription ??
            item.description
        )
    }, [
        descriptionUri,
        item.description,
        metadata?.description,
        metadata?.markdownDescription,
        metadata?.shortDescription,
        metadata?.title,
    ])

    return (
        <BaseCard style={styles.item} onPress={() => onPress(item.proposalId)}>
            <BaseView style={styles.iconContainer}>
                <BaseIcon
                    name="icon-file-signature"
                    size={16}
                    color={theme.isDark ? COLORS.GREY_700 : COLORS.GREY_600}
                />
            </BaseView>
            <BaseView flex={1} gap={4}>
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                    {descriptionText}
                </BaseText>
                <BaseText
                    typographyFont="caption"
                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}
                    numberOfLines={3}>
                    {metadata?.shortDescription}
                </BaseText>
            </BaseView>
            <BaseIcon name="icon-chevron-right" size={16} color={theme.isDark ? COLORS.GREY_400 : COLORS.GREY_500} />
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        item: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            minHeight: 72,
            gap: 12,
        },
        iconContainer: {
            justifyContent: "center",
            alignItems: "center",
            height: 32,
            width: 32,
            borderRadius: 16,
            backgroundColor: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_200,
        },
    })
