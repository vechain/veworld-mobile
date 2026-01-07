import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import React, { ComponentProps, PropsWithChildren, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, ColorThemeType, VET, VTHO } from "~Constants"
import { useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { useDelegationExitDays, useValidatorDetails } from "~Hooks/Staking"
import { getCollectibleMetadataOptions } from "~Hooks/useCollectibleMetadata"
import { useTokenURI } from "~Hooks/useCollectibleMetadata/useTokenURI"
import { useStargateClaimableRewards } from "~Hooks/useStargateClaimableRewards"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useI18nContext } from "~i18n"
import type { NodeInfo } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"
import { getTokenLevelName, TokenLevelId } from "~Utils/StargateUtils"
import { StargateImage } from "./StargateImage"

type Props = {
    item: NodeInfo
}

const SimpleRowItem = ({
    label,
    value,
    testID,
    children,
}: PropsWithChildren<{ label: string; value: string; testID: string }>) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" py={2} testID={testID}>
            <BaseText color={theme.colors.assetDetailsCard.text} typographyFont="captionMedium">
                {label}
            </BaseText>
            <BaseView gap={8} flexDirection="row">
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800} typographyFont="captionMedium">
                    {value}
                </BaseText>
                {children}
            </BaseView>
        </BaseView>
    )
}

const TokenRowItem = ({
    value,
    icon,
    ...props
}: Omit<ComponentProps<typeof SimpleRowItem>, "children"> & { icon: string }) => {
    const { formatLocale } = useFormatFiat()

    const formattedValue = useMemo(() => {
        const humanBalance = BigNutils(value).toHuman(VET.decimals).toString

        return formatDisplayNumber(humanBalance, { locale: formatLocale })
    }, [value, formatLocale])

    return (
        <SimpleRowItem value={formattedValue} {...props}>
            <TokenImage icon={icon} isVechainToken iconSize={16} rounded={true} />
        </SimpleRowItem>
    )
}

export const StargateCarouselItem = ({ item }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { formatLocale } = useFormatFiat()

    const network = useAppSelector(selectSelectedNetwork)

    const stargateConfig = useStargateConfig(network)

    const { data: tokenURI, isLoading: isTokenURILoading } = useTokenURI({
        address: stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS,
        tokenId: item.nodeId,
    })

    // Use the unlocked version of the NFT image (without the status badge baked in)
    const unlockedTokenURI = useMemo(() => tokenURI?.replace(/_locked/, ""), [tokenURI])

    const metadataOpts = useMemo(
        () => getCollectibleMetadataOptions(unlockedTokenURI, isTokenURILoading),
        [isTokenURILoading, unlockedTokenURI],
    )

    const { data } = useQuery(metadataOpts)

    const { data: claimableRewards } = useStargateClaimableRewards({ nodeId: item.nodeId })

    const isExiting = item.delegationStatus === "EXITING"
    const { exitDays } = useDelegationExitDays({
        validatorId: item.validatorId,
        enabled: isExiting,
    })

    const { data: validatorDetails } = useValidatorDetails({ validatorId: item.validatorId })

    const tokenLevel = useMemo(
        () => (item.nodeLevel ? (item.nodeLevel as TokenLevelId) : undefined) ?? TokenLevelId.None,
        [item.nodeLevel],
    )

    const tokenLevelName = useMemo(() => getTokenLevelName(tokenLevel), [tokenLevel])

    const apy = useMemo(() => {
        if (!item.validatorId) return "-"
        const yieldValue = (validatorDetails?.nftYieldsNextCycle?.[tokenLevelName] as number) ?? 0
        const displayValue = formatDisplayNumber(yieldValue, {
            forceDecimals: 1,
            includeSymbol: false,
            locale: formatLocale,
            skipThreshold: true,
        })
        return `${displayValue}%`
    }, [formatLocale, item.validatorId, tokenLevelName, validatorDetails?.nftYieldsNextCycle])

    const cyclePeriod = useMemo(() => {
        if (!item.validatorId) return "-"
        return LL.STARGATE_DAYS({
            days: Math.floor(
                moment
                    .duration(
                        BigNutils(validatorDetails?.cyclePeriodLength ?? "0")
                            .multiply(10)
                            .multiply(1000).toNumber,
                    )
                    .asDays(),
            ),
        })
    }, [LL, item.validatorId, validatorDetails?.cyclePeriodLength])

    return (
        <BaseCard containerStyle={styles.root} style={styles.rootContent}>
            <StargateImage
                uri={data?.image}
                delegationStatus={item.delegationStatus}
                exitDays={isExiting ? exitDays : undefined}
            />
            <BaseText color={theme.colors.assetDetailsCard.title} typographyFont="bodySemiBold">
                {tokenLevelName}
            </BaseText>
            <BaseView flexDirection="column" gap={8}>
                <SimpleRowItem label={LL.STARGATE_APY()} value={apy} testID="STARGATE_CAROUSEL_ITEM_VALUE_APY" />
                <SimpleRowItem
                    label={LL.STARGATE_CYCLE_DURATION()}
                    value={cyclePeriod}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_CYCLE_DURATION"
                />
                <TokenRowItem
                    label={LL.STARGATE_LOCKED()}
                    value={item.vetAmountStaked ?? "0"}
                    icon={VET.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_LOCKED"
                />
                <TokenRowItem
                    label={LL.STARGATE_REWARDS()}
                    value={item.accumulatedRewards ?? "0"}
                    icon={VTHO.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_REWARDS"
                />
                <TokenRowItem
                    label={LL.STARGATE_CLAIMABLE()}
                    value={claimableRewards ?? "0"}
                    icon={VTHO.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_CLAIMABLE"
                />
            </BaseView>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderRadius: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
            borderWidth: 1,
            minWidth: 240,
            height: "100%",
        },
        rootContent: {
            padding: 16,
            flexDirection: "column",
            gap: 12,
        },
        image: {
            width: 208,
            height: 160,
            borderRadius: 8,
        },
    })
