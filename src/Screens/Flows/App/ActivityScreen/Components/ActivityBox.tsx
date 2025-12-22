import moment from "moment"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView, NFTMedia } from "~Components"
import { B3TR, COLORS, DIRECTIONS, typography, VET, VOT3, VTHO } from "~Constants"
import { useFetchValidators, useFormatFiat, useTheme, useThemedStyles, useVns } from "~Hooks"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useI18nContext } from "~i18n"
import {
    Activity,
    ActivityEvent,
    ActivityStatus,
    B3trActionActivity,
    B3trClaimRewardActivity,
    B3trProposalSupportActivity,
    B3trProposalVoteActivity,
    B3trSwapB3trToVot3Activity,
    B3trSwapVot3ToB3trActivity,
    B3trUpgradeGmActivity,
    B3trXAllocationVoteActivity,
    ConnectedAppActivity,
    DappTxActivity,
    FungibleToken,
    FungibleTokenActivity,
    IconKey,
    LoginActivity,
    NFTMarketplaceActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    StargateActivity,
    SwapActivity,
    TransactionOutcomes,
    TypedDataActivity,
    UnknownTxActivity,
    VeBetterDaoDapp,
    VeVoteCastActivity,
} from "~Model"
import {
    selectAllTokens,
    selectCustomTokens,
    selectFeaturedDapps,
    selectOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, BigNutils, URIUtils, ValidatorUtils } from "~Utils"
import { formatWithLessThan } from "~Utils/StandardizedFormatting"
import { getTokenLevelName } from "~Utils/StargateUtils"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"
import { StackedApps } from "./StackedApps"

type GradientConfig = {
    colors: string[]
    angle?: number
    start?: { x: number; y: number }
    end?: { x: number; y: number }
}

type ActivityBoxProps = {
    icon: IconKey
    /**
     * Timestamp of the activity
     */
    timestamp: number
    /**
     * Timestamp renderer. Defaults to HH:mm format
     */
    timestampRenderer?: (timestamp: number) => string
    title: string
    description?: string | React.ReactNode
    rightAmount?: string
    rightAmountDescription?: string | React.ReactNode
    nftImage?: string
    activityStatus?: ActivityStatus
    iconColor?: string
    iconBackgroundColor?: string | GradientConfig
    onPress: () => void
    /**
     * If set to true, the title will be lighter than the description. Default is `false`
     */
    invertedStyles?: boolean
    testID?: string
}

const defaultTimestampRenderer = (timestamp: number) => moment(timestamp).format("HH:mm")

export type OverridableActivityBoxProps<TActivity extends Activity> = {
    activity: TActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
} & Pick<ActivityBoxProps, "timestampRenderer">

const BaseActivityBox = ({
    description,
    icon,
    timestamp,
    timestampRenderer = defaultTimestampRenderer,
    title,
    rightAmount,
    rightAmountDescription,
    nftImage,
    iconColor = COLORS.GREY_600,
    iconBackgroundColor = COLORS.GREY_100,
    activityStatus,
    onPress,
    invertedStyles,
    testID,
}: ActivityBoxProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const showDescription = !!description
    const showActivityStatus = !!activityStatus && activityStatus !== ActivityStatus.SUCCESS
    const showRightAmount = !!rightAmount
    const showrightAmountDescription = !!rightAmountDescription
    const showNftImage = !!nftImage

    const renderRightElement = () => {
        if (!nftImage && !rightAmount && !rightAmountDescription) {
            return null
        }

        if (showNftImage) {
            return <NFTMedia uri={nftImage ?? ""} styles={styles.rightImageContainer} testID="nft-media" />
        }

        return (
            <BaseView flexDirection="column" gap={2} style={styles.rightTextContainer}>
                {showRightAmount && (
                    <BaseText
                        typographyFont="captionSemiBold"
                        numberOfLines={1}
                        color={theme.colors.activityCard.title}>
                        {rightAmount}
                    </BaseText>
                )}
                {showrightAmountDescription &&
                    (typeof rightAmountDescription === "string" ? (
                        <BaseText
                            typographyFont="captionMedium"
                            numberOfLines={1}
                            color={theme.colors.activityCard.title}>
                            {rightAmountDescription}
                        </BaseText>
                    ) : (
                        rightAmountDescription
                    ))}
            </BaseView>
        )
    }

    const renderIconContainer = () => {
        const isGradient = typeof iconBackgroundColor === "object"

        if (isGradient) {
            const gradientConfig = iconBackgroundColor as GradientConfig
            return (
                <LinearGradient
                    colors={gradientConfig.colors}
                    angle={gradientConfig.angle}
                    start={gradientConfig.start}
                    end={gradientConfig.end}
                    style={styles.iconContainer}>
                    <BaseIcon name={icon} size={16} color={iconColor} testID="magnify" />
                </LinearGradient>
            )
        }

        return (
            <BaseView style={[styles.iconContainer, { backgroundColor: iconBackgroundColor as string }]}>
                <BaseIcon name={icon} size={16} color={iconColor} testID="magnify" bg={iconBackgroundColor as string} />
            </BaseView>
        )
    }

    return (
        <BaseCard
            testID={testID}
            style={[
                styles.rootContainer,
                //Make sure that without any description, the height stays the same.
                !showDescription && {
                    paddingVertical:
                        12 + (invertedStyles ? typography.lineHeight.bodySemiBold : typography.lineHeight.body) / 2,
                },
            ]}
            onPress={onPress}>
            {renderIconContainer()}

            <BaseSpacer width={16} />

            <BaseView flexDirection="column" flex={1}>
                <BaseText typographyFont="smallCaptionMedium" color={theme.colors.activityCard.time}>
                    {timestampRenderer(timestamp)}
                </BaseText>
                <BaseSpacer height={2} />
                <BaseView style={styles.titleContainer}>
                    <BaseText
                        typographyFont={invertedStyles ? "captionMedium" : "bodySemiBold"}
                        numberOfLines={1}
                        color={
                            invertedStyles ? theme.colors.activityCard.subtitleBold : theme.colors.activityCard.title
                        }
                        flexDirection="row">
                        {title}
                    </BaseText>
                    {showActivityStatus && <ActivityStatusIndicator activityStatus={ActivityStatus.REVERTED} />}
                </BaseView>
                <BaseSpacer height={2} />
                {showDescription &&
                    (typeof description === "string" ? (
                        <BaseText
                            typographyFont={invertedStyles ? "bodySemiBold" : "captionMedium"}
                            numberOfLines={1}
                            color={
                                invertedStyles
                                    ? theme.colors.activityCard.title
                                    : theme.colors.activityCard.subtitleBold
                            }>
                            {description}
                        </BaseText>
                    ) : (
                        description
                    ))}
            </BaseView>

            <BaseSpacer width={8} />

            {renderRightElement()}
        </BaseCard>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            height: 80,
        },
        iconContainer: {
            justifyContent: "center",
            alignItems: "center",
            height: 32,
            width: 32,
            borderRadius: 16,
        },
        titleContainer: {
            flexDirection: "row",
            alignItems: "center",
            // flex: 1,
            width: "100%",
        },
        textContainer: {
            flex: 1,
            height: "100%",
            // alignContent: "center",
        },
        rightTextContainer: {
            alignItems: "flex-end",
            flexShrink: 0,
        },
        rightImageContainer: {
            alignItems: "center",
            height: 40,
            width: 40,
            overflow: "hidden",
            borderRadius: 4,
        },
    })

const TokenTransfer = ({ activity, onPress, ...props }: OverridableActivityBoxProps<FungibleTokenActivity>) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { formatLocale } = useFormatFiat()

    const { amount, timestamp, tokenAddress, direction, to, from } = activity

    const type = direction === DIRECTIONS.UP ? "sent" : "received"

    const { name, address } = useVns({
        address: direction === DIRECTIONS.UP ? to?.[0] ?? "" : from,
    })

    const addressOrUsername = useMemo(() => {
        if (name) return name
        return AddressUtils.humanAddress(address)
    }, [address, name])

    const customTokens = useAppSelector(selectCustomTokens)
    const officialTokens = useAppSelector(selectOfficialTokens)

    const allTokens = [customTokens, officialTokens].flat()

    const token = AddressUtils.compareAddresses(tokenAddress, VET.address)
        ? VET
        : allTokens.find(_token => _token.address === tokenAddress)

    const getAmountTransferred = () => {
        if (!token?.decimals) {
            return "0"
        }

        const humanAmount = Number(BigNutils(amount).toHuman(token?.decimals ?? 0).toString).toFixed(6)
        return formatWithLessThan(humanAmount, 0.01, { locale: formatLocale })
    }

    const getActivityProps = (): Omit<ActivityBoxProps, "timestamp" | "onPress"> => {
        const amountToDisplay = getAmountTransferred()

        switch (type) {
            case "received":
                return {
                    title: LL.TOKEN_TRANSFER_RECEIVED(),
                    description: (
                        <BaseView flexDirection="row" gap={4}>
                            <BaseText
                                typographyFont="captionMedium"
                                color={theme.colors.activityCard.subtitleLight}
                                textTransform="lowercase"
                                flexShrink={0}>
                                {LL.FROM()}
                            </BaseText>
                            <BaseText
                                typographyFont="captionMedium"
                                color={theme.colors.activityCard.subtitleBold}
                                numberOfLines={1}
                                flex={1}
                                testID="TOKEN_TRANSFER_SENDER">
                                {addressOrUsername}
                            </BaseText>
                        </BaseView>
                    ),
                    rightAmount: `${DIRECTIONS.UP} ${amountToDisplay}`,
                    rightAmountDescription: token?.symbol ?? "",
                    icon: "icon-arrow-down",
                }
            case "sent":
                return {
                    title: LL.TOKEN_TRANSFER_SENT(),
                    description: (
                        <BaseView flexDirection="row" gap={4}>
                            <BaseText
                                typographyFont="captionMedium"
                                color={theme.colors.activityCard.subtitleLight}
                                textTransform="lowercase"
                                flexShrink={0}>
                                {LL.TO()}
                            </BaseText>
                            <BaseText
                                typographyFont="captionMedium"
                                color={theme.colors.activityCard.subtitleBold}
                                numberOfLines={1}
                                flex={1}
                                testID="TOKEN_TRANSFER_RECEIVER">
                                {addressOrUsername}
                            </BaseText>
                        </BaseView>
                    ),
                    rightAmount: `${DIRECTIONS.DOWN} ${amountToDisplay}`,
                    rightAmountDescription: token?.symbol ?? "",
                    icon: "icon-arrow-up",
                }
        }
    }

    const onPressHandler = () => {
        onPress(activity, token)
    }

    return (
        <BaseActivityBox
            testID={`FT-TRANSFER-${activity.id}`}
            timestamp={timestamp}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
            {...getActivityProps()}
        />
    )
}

const TokenSwap = ({ activity, onPress, ...props }: OverridableActivityBoxProps<SwapActivity>) => {
    const { LL } = useI18nContext()

    const title = LL.DAPP_TRANSACTION_SWAP()
    const icon = "icon-arrow-left-right"
    const theme = useTheme()
    const { formatLocale } = useFormatFiat()

    const allTokens = useAppSelector(selectAllTokens)
    const outputToken = allTokens.find(_token => AddressUtils.compareAddresses(_token.address, activity.outputToken))
    const inputToken = allTokens.find(_token => AddressUtils.compareAddresses(_token.address, activity.inputToken))

    const humanPaidAmount = Number(BigNutils(activity.inputValue).toHuman(inputToken?.decimals ?? 0).toString).toFixed(
        6,
    )
    const paidAmount = formatWithLessThan(humanPaidAmount, 0.01, { locale: formatLocale })

    const humanReceivedAmount = Number(
        BigNutils(activity.outputValue).toHuman(outputToken?.decimals ?? 0).toString,
    ).toFixed(6)
    const receivedAmount = formatWithLessThan(humanReceivedAmount, 0.01, { locale: formatLocale })

    const rightAmount = `${DIRECTIONS.UP} ${receivedAmount} ${outputToken?.symbol ?? ""}`
    const rightAmountDescription = `${DIRECTIONS.DOWN} ${paidAmount} ${inputToken?.symbol ?? ""}`

    const onSwapPressHandler = () => {
        onPress(activity, undefined, true)
    }

    return (
        <BaseActivityBox
            testID={`SWAP-${activity.id}`}
            icon={icon}
            timestamp={activity.timestamp}
            title={title}
            rightAmount={rightAmount}
            rightAmountDescription={
                <BaseText
                    typographyFont="smallCaptionMedium"
                    numberOfLines={1}
                    color={theme.colors.activityCard.swap}
                    allowFontScaling={false}>
                    {rightAmountDescription}
                </BaseText>
            }
            onPress={onSwapPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const DAppTransaction = ({ activity, onPress, ...props }: OverridableActivityBoxProps<DappTxActivity>) => {
    const { LL } = useI18nContext()

    const title = activity.isTransaction ? LL.DAPP_TRANSACTION_TITLE() : LL.DAPP_CONNECTION()

    const theme = useTheme()

    const description = useMemo(() => {
        if (activity.linkUrl) return activity.linkUrl
        if (activity.isTransaction) return AddressUtils.humanAddress(activity.to?.[0] ?? "")
        return activity.name
    }, [activity.isTransaction, activity.linkUrl, activity.name, activity.to])

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`DAPP-TX-${activity.id}`}
            icon="icon-layout-grid"
            timestamp={activity.timestamp}
            title={title}
            description={
                <BaseView flexDirection="row" gap={4}>
                    <BaseText
                        typographyFont="captionMedium"
                        color={theme.colors.activityCard.subtitleLight}
                        textTransform="lowercase"
                        flexShrink={0}>
                        {LL.TO()}
                    </BaseText>
                    <BaseText
                        typographyFont="captionMedium"
                        color={theme.colors.activityCard.subtitleBold}
                        numberOfLines={1}
                        flex={1}>
                        {description}
                    </BaseText>
                </BaseView>
            }
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const DAppSignCertBox = ({ activity, onPress, ...props }: OverridableActivityBoxProps<SignCertActivity>) => {
    const { LL } = useI18nContext()
    const title = LL.DAPP_SIGN_CERT()
    const description = activity?.name

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`DAPP-SIGN-CERT-${activity.id}`}
            icon="icon-edit-2"
            timestamp={activity.timestamp}
            title={title}
            description={description}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const NFTTransfer = ({ activity, onPress, ...props }: OverridableActivityBoxProps<NonFungibleTokenActivity>) => {
    const { LL } = useI18nContext()
    const { image, collectionName } = useCollectibleDetails({
        address: activity.contractAddress,
        tokenId: activity.tokenId,
    })
    const isReceived = activity.direction === DIRECTIONS.DOWN
    const title = isReceived ? LL.NFT_TRANSFER_RECEIVED() : LL.NFT_TRANSFER_SENT()

    const validatedCollectionName = () => {
        if (!collectionName) return LL.UNKNOWN_COLLECTION()
        return collectionName
    }

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`NFT-TRANSFER-${activity.id}`}
            icon="icon-image"
            timestamp={activity.timestamp}
            title={title}
            description={validatedCollectionName()}
            onPress={onPressHandler}
            nftImage={image}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const NFTSale = ({ activity, onPress, ...props }: OverridableActivityBoxProps<NFTMarketplaceActivity>) => {
    const { LL } = useI18nContext()
    const { image, collectionName } = useCollectibleDetails({
        address: activity.contractAddress,
        tokenId: activity.tokenId,
    })
    const { formatLocale } = useFormatFiat()
    const customTokens = useAppSelector(selectCustomTokens)
    const officialTokens = useAppSelector(selectOfficialTokens)

    const allTokens = [customTokens, officialTokens].flat()
    // Determine if user is buyer or seller based on their address
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isBuyer = AddressUtils.compareAddresses(activity.buyer, selectedAccount.address)

    const title = isBuyer ? LL.NFT_PURCHASED() : LL.NFT_SOLD()

    const validatedCollectionName = () => {
        if (!collectionName) return LL.UNKNOWN_COLLECTION()
        return collectionName
    }

    const token = AddressUtils.compareAddresses(activity.tokenAddress, VET.address)
        ? VET
        : allTokens.find(_token => _token.address === activity.tokenAddress)

    // Format the price
    const humanPrice = Number(BigNutils(activity.price).toHuman(18).toString).toFixed(6)
    const formattedPrice = formatWithLessThan(humanPrice, 0.01, { locale: formatLocale })

    const onPressHandler = () => {
        onPress(activity)
    }

    const rightAmount = isBuyer ? `${DIRECTIONS.DOWN} ${formattedPrice}` : `${DIRECTIONS.UP} ${formattedPrice}`

    return (
        <BaseActivityBox
            testID={`NFT-SALE-${activity.id}`}
            icon="icon-image"
            timestamp={activity.timestamp}
            title={title}
            description={validatedCollectionName()}
            rightAmount={rightAmount}
            rightAmountDescription={token?.symbol ?? "VET"}
            onPress={onPressHandler}
            nftImage={image}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const ConnectedAppActivityBox = ({
    activity,
    onPress,
    ...props
}: OverridableActivityBoxProps<ConnectedAppActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`CONNECTED-APP-${activity.id}`}
            icon="icon-laptop"
            timestamp={activity.timestamp}
            title={LL.CONNECTED_APP_TITLE()}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const SignedTypedData = ({ activity, onPress, ...props }: OverridableActivityBoxProps<TypedDataActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`SIGN-TYPED-DATA-${activity.id}`}
            icon="icon-check-check"
            timestamp={activity.timestamp}
            title={LL.CONNECTED_APP_SIGN_TYPED_DATA()}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

type B3trActionProps = OverridableActivityBoxProps<B3trActionActivity> & {
    veBetterDaoDapps: VeBetterDaoDapp[]
}

const B3trAction = ({ activity, onPress, veBetterDaoDapps, ...props }: B3trActionProps) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const onPressHandler = () => {
        onPress(activity)
    }

    const dapp = veBetterDaoDapps.find(d => d.id === activity.appId)
    const humanReward = Number(BigNutils(activity.value).toHuman(B3TR.decimals).toString).toFixed(6)
    const rewardValue = formatWithLessThan(humanReward, 0.01, { locale: formatLocale })

    return (
        <BaseActivityBox
            testID={`B3TR-ACTION-${activity.id}`}
            icon="icon-leaf"
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={LL.B3TR_ACTION()}
            description={dapp?.name}
            onPress={onPressHandler}
            rightAmount={`${DIRECTIONS.UP} ${rewardValue}`}
            rightAmountDescription={B3TR.symbol}
            invertedStyles
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trProposalVote = ({ activity, onPress, ...props }: OverridableActivityBoxProps<B3trProposalVoteActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`B3TR-PROPOSAL-VOTE-${activity.id}`}
            icon="icon-vote"
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={LL.B3TR_PROPOSAL_VOTE()}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trXAllocationVote = ({
    activity,
    onPress,
    ...props
}: OverridableActivityBoxProps<B3trXAllocationVoteActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`B3TR-XALLOCATION-VOTE-${activity.id}`}
            icon="icon-vote"
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={LL.B3TR_XALLOCATION_VOTE({ number: parseInt(activity.roundId, 10) })}
            rightAmountDescription={<StackedApps appVotes={activity.appVotes} roundId={activity.roundId} />}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trClaimReward = ({ activity, onPress, ...props }: OverridableActivityBoxProps<B3trClaimRewardActivity>) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const onPressHandler = () => {
        onPress(activity)
    }

    const humanReward = Number(BigNutils(activity.value).toHuman(B3TR.decimals).toString).toFixed(6)
    const rewardValue = formatWithLessThan(humanReward, 0.01, { locale: formatLocale })

    return (
        <BaseActivityBox
            testID={`B3TR-CLAIM-REWARD-${activity.id}`}
            icon="icon-leaf"
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={LL.B3TR_CLAIM_REWARD()}
            onPress={onPressHandler}
            rightAmount={`${DIRECTIONS.UP} ${rewardValue}`}
            rightAmountDescription={B3TR.symbol}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trUpgradeGM = ({ activity, onPress, ...props }: OverridableActivityBoxProps<B3trUpgradeGmActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`B3TR-UPGRADE-GM-${activity.id}`}
            icon="icon-vote"
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={LL.B3TR_UPGRADE_GM()}
            description={activity.newLevel}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trSwapB3trToVot3 = ({
    activity,
    onPress,
    ...props
}: OverridableActivityBoxProps<B3trSwapB3trToVot3Activity>) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()
    const title = LL.TOKEN_CONVERSION()
    const theme = useTheme()

    const humanAmount = Number(BigNutils(activity.value).toHuman(B3TR.decimals ?? 0).toString).toFixed(6)
    const amount = formatWithLessThan(humanAmount, 0.01, { locale: formatLocale })

    const rightAmount = `${DIRECTIONS.UP} ${amount} ${VOT3.symbol}`
    const rightAmountDescription = `${DIRECTIONS.DOWN}  ${amount} ${B3TR.symbol}`

    const onSwapPressHandler = () => {
        onPress(activity, undefined, true)
    }

    return (
        <BaseActivityBox
            testID={`B3TR-SWAP-B3TR-TO-VOT3-${activity.id}`}
            icon={"icon-convert"}
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={title}
            rightAmount={rightAmount}
            rightAmountDescription={
                <BaseText typographyFont="smallCaptionMedium" numberOfLines={1} color={theme.colors.activityCard.swap}>
                    {rightAmountDescription}
                </BaseText>
            }
            onPress={onSwapPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trSwapVot3ToB3tr = ({
    activity,
    onPress,
    ...props
}: OverridableActivityBoxProps<B3trSwapVot3ToB3trActivity>) => {
    const { LL } = useI18nContext()
    const title = LL.TOKEN_CONVERSION()
    const theme = useTheme()
    const { formatLocale } = useFormatFiat()

    const humanAmount = Number(BigNutils(activity.value).toHuman(B3TR.decimals ?? 0).toString).toFixed(6)
    const amount = formatWithLessThan(humanAmount, 0.01, { locale: formatLocale })

    const rightAmount = `${DIRECTIONS.UP} ${amount} ${B3TR.symbol}`
    const rightAmountDescription = `${DIRECTIONS.DOWN}  ${amount} ${VOT3.symbol}`

    const onSwapPressHandler = () => {
        onPress(activity, undefined, true)
    }

    return (
        <BaseActivityBox
            testID={`B3TR-SWAP-VOT3-TO-B3TR-${activity.id}`}
            icon={"icon-convert"}
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={title}
            rightAmount={rightAmount}
            rightAmountDescription={
                <BaseText typographyFont="smallCaptionMedium" numberOfLines={1} color={theme.colors.activityCard.swap}>
                    {rightAmountDescription}
                </BaseText>
            }
            onPress={onSwapPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const B3trProposalSupport = ({
    activity,
    onPress,
    ...props
}: OverridableActivityBoxProps<B3trProposalSupportActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`B3TR-PROPOSAL-SUPPORT-${activity.id}`}
            icon="icon-vote"
            iconColor={COLORS.GREY_700}
            iconBackgroundColor={COLORS.B3TR_ICON_BACKGROUND}
            timestamp={activity.timestamp}
            title={LL.B3TR_PROPOSAL_SUPPORT()}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const UnknownTx = ({ activity, onPress, ...props }: OverridableActivityBoxProps<UnknownTxActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`UNKNOWN-TX-${activity.id}`}
            icon="icon-block"
            timestamp={activity.timestamp}
            title={LL.UNKNOWN_TX()}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const Staking = ({ activity, onPress, ...props }: OverridableActivityBoxProps<StargateActivity>) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { validators } = useFetchValidators()
    const { name: vnsName } = useVns({
        address: activity.validator || activity.to?.[0],
        name: "",
    })
    const network = useAppSelector(selectSelectedNetwork)
    const config = useStargateConfig(network)
    const { image } = useCollectibleDetails({
        address: config.STARGATE_NFT_CONTRACT_ADDRESS,
        tokenId: activity.tokenId,
        blockNumber: activity.blockNumber,
    })

    const onPressHandler = useCallback(() => {
        onPress(activity)
    }, [activity, onPress])

    const icon = useMemo<IconKey>(() => {
        switch (activity.eventName) {
            case ActivityEvent.STARGATE_STAKE:
                return "icon-download"
            case ActivityEvent.STARGATE_UNSTAKE:
                return "icon-upload"
            case ActivityEvent.STARGATE_DELEGATE_LEGACY:
                return "icon-lock"
            case ActivityEvent.STARGATE_UNDELEGATE_LEGACY:
                return "icon-unlock"
            case ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY:
            case ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY:
            case ActivityEvent.STARGATE_CLAIM_REWARDS:
                return "icon-gift"
            case ActivityEvent.STARGATE_BOOST:
                return "icon-thunder"
            case ActivityEvent.STARGATE_DELEGATE_REQUEST:
                return "icon-log-in"
            case ActivityEvent.STARGATE_DELEGATE_EXIT_REQUEST:
            case ActivityEvent.STARGATE_DELEGATION_EXITED:
            case ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR:
            case ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED:
                return "icon-log-out"
            case ActivityEvent.STARGATE_DELEGATE_ACTIVE:
                return "icon-check-circle"
            case ActivityEvent.STARGATE_MANAGER_ADDED:
                return "icon-user-plus"
            case ActivityEvent.STARGATE_MANAGER_REMOVED:
                return "icon-user-minus"
            default:
                return "icon-blocks"
        }
    }, [activity.eventName])

    const hasRightAmount = useMemo(() => {
        return ![
            ActivityEvent.STARGATE_MANAGER_ADDED,
            ActivityEvent.STARGATE_MANAGER_REMOVED,
            ActivityEvent.STARGATE_UNDELEGATE_LEGACY,
            ActivityEvent.STARGATE_DELEGATE_ACTIVE,
            ActivityEvent.STARGATE_DELEGATE_EXIT_REQUEST,
            ActivityEvent.STARGATE_DELEGATION_EXITED,
            ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR,
            ActivityEvent.STARGATE_DELEGATE_REQUEST,
            ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED,
            ActivityEvent.STARGATE_DELEGATE_LEGACY,
        ].includes(activity.type as ActivityEvent)
    }, [activity?.type])

    const activityTitle = useMemo(() => {
        switch (activity.eventName) {
            case ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY:
                return LL.ACTIVITY_STARGATE_CLAIM_REWARDS_BASE_LABEL()
            case ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY:
                return LL.ACTIVITY_STARGATE_CLAIM_REWARDS_DELEGATE_LABEL()
            case ActivityEvent.STARGATE_DELEGATE_LEGACY:
                return LL.ACTIVITY_STARGATE_NODE_DELEGATE_LABEL()
            case ActivityEvent.STARGATE_UNDELEGATE_LEGACY:
                return LL.ACTIVITY_STARGATE_NODE_UNDELEGATE_LABEL()
            case ActivityEvent.STARGATE_STAKE:
                return LL.ACTIVITY_STARGATE_STAKE_LABEL()
            case ActivityEvent.STARGATE_UNSTAKE:
                return LL.ACTIVITY_STARGATE_UNSTAKE_LABEL()
            case ActivityEvent.STARGATE_DELEGATE_REQUEST:
                return LL.ACTIVITY_STARGATE_DELEGATION_REQUESTED_LABEL()
            case ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED:
                return LL.ACTIVITY_STARGATE_DELEGATION_REQUEST_CANCELLED()
            case ActivityEvent.STARGATE_DELEGATE_EXIT_REQUEST:
                return LL.ACTIVITY_STARGATE_DELEGATION_EXIT_REQUESTED_LABEL()
            case ActivityEvent.STARGATE_DELEGATION_EXITED:
                return LL.ACTIVITY_STARGATE_DELEGATION_EXITED_LABEL()
            case ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR:
                return LL.ACTIVITY_STARGATE_DELEGATION_EXITED_LABEL()
            case ActivityEvent.STARGATE_DELEGATE_ACTIVE:
                return LL.ACTIVITY_STARGATE_DELEGATION_ACTIVE_LABEL()
            case ActivityEvent.STARGATE_MANAGER_ADDED:
                return LL.ACTIVITY_STARTGATE_MANAGER_ADDED_LABEL()
            case ActivityEvent.STARGATE_MANAGER_REMOVED:
                return LL.ACTIVITY_STARTGATE_MANAGER_REMOVED_LABEL()
            case ActivityEvent.STARGATE_BOOST:
                return LL.ACTIVITY_STARTGATE_MATURITY_BOOSTED_LABEL()
            case ActivityEvent.STARGATE_CLAIM_REWARDS:
                return LL.ACTIVITY_STARGATE_CLAIM_REWARDS_DELEGATE_LABEL()
            default:
                return LL.ACTIVITY_STARGATE_STAKE_LABEL()
        }
    }, [activity.eventName, LL])

    const isMinus = useMemo(() => {
        return !(
            activity?.type === ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY ||
            activity?.type === ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY ||
            activity?.type === ActivityEvent.STARGATE_CLAIM_REWARDS ||
            activity?.type === ActivityEvent.STARGATE_UNSTAKE ||
            activity?.type === ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED ||
            activity?.type === ActivityEvent.STARGATE_DELEGATION_EXITED ||
            activity?.type === ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR
        )
    }, [activity?.type])

    const humanAmount = Number(BigNutils(activity.value).toHuman(B3TR.decimals ?? 0).toString).toFixed(6)
    const amount = formatWithLessThan(humanAmount, 0.01, { locale: formatLocale })

    const rightAmount = useMemo(() => {
        if (hasRightAmount) {
            return `${isMinus ? DIRECTIONS.DOWN : DIRECTIONS.UP} ${amount}`
        }
        return undefined
    }, [hasRightAmount, isMinus, amount])

    const isDelegationOrDelegateActivity = useMemo(() => {
        return (
            activity.eventName === ActivityEvent.STARGATE_DELEGATE_LEGACY ||
            activity.eventName === ActivityEvent.STARGATE_DELEGATE_REQUEST ||
            activity.eventName === ActivityEvent.STARGATE_DELEGATE_EXIT_REQUEST ||
            activity.eventName === ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED ||
            activity.eventName === ActivityEvent.STARGATE_DELEGATION_EXITED ||
            activity.eventName === ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR ||
            activity.eventName === ActivityEvent.STARGATE_DELEGATE_ACTIVE
        )
    }, [activity.eventName])

    const description = useMemo(() => {
        if (isDelegationOrDelegateActivity && activity.validator) {
            const validatorName = ValidatorUtils.getValidatorName(validators ?? [], activity.validator)
            return validatorName || vnsName || AddressUtils.humanAddress(activity.validator)
        }
        if (
            (activity.eventName === ActivityEvent.STARGATE_MANAGER_ADDED ||
                activity.eventName === ActivityEvent.STARGATE_MANAGER_REMOVED) &&
            activity.to?.[0]
        ) {
            const isUserAddress = AddressUtils.compareAddresses(activity.to[0], selectedAccount.address)
            if (isUserAddress && activity.tokenId) {
                return `#${activity.tokenId}`
            }
            return vnsName || AddressUtils.humanAddress(activity.to[0])
        }
        return activity.levelId ? getTokenLevelName(activity.levelId) : ""
    }, [
        isDelegationOrDelegateActivity,
        activity.validator,
        activity.eventName,
        activity.to,
        activity.levelId,
        activity.tokenId,
        validators,
        vnsName,
        selectedAccount.address,
    ])

    const rightAmountDescription = useMemo(() => {
        switch (activity.eventName) {
            case ActivityEvent.STARGATE_BOOST:
            case ActivityEvent.STARGATE_CLAIM_REWARDS:
            case ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY:
            case ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY:
                return VTHO.symbol
            case ActivityEvent.STARGATE_STAKE:
            case ActivityEvent.STARGATE_UNSTAKE:
                return VET.symbol
            default:
                return null
        }
    }, [activity.eventName])

    const imageToShow = useMemo(() => {
        switch (activity.eventName) {
            case ActivityEvent.STARGATE_BOOST:
            case ActivityEvent.STARGATE_CLAIM_REWARDS:
            case ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY:
            case ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY:
            case ActivityEvent.STARGATE_STAKE:
            case ActivityEvent.STARGATE_UNSTAKE:
                return undefined
            default:
                return image
        }
    }, [activity.eventName, image])

    return (
        <BaseActivityBox
            testID={`STARGATE-${activity.eventName}-${activity.id}`}
            iconColor={COLORS.WHITE}
            iconBackgroundColor={{
                colors: ["#820744", "#211EAB"],
                angle: 132,
                start: { x: 0.15, y: 0 },
                end: { x: 0.87, y: 1 },
            }}
            timestamp={activity.timestamp}
            icon={icon}
            title={activityTitle}
            description={description}
            rightAmount={rightAmount}
            rightAmountDescription={rightAmountDescription}
            onPress={onPressHandler}
            nftImage={imageToShow}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const VeVoteCast = ({ activity, onPress, ...props }: OverridableActivityBoxProps<VeVoteCastActivity>) => {
    const { LL } = useI18nContext()

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            testID={`VEVOTE-CAST-${activity.id}`}
            icon="icon-vote"
            timestamp={activity.timestamp}
            title={LL.VEVOTE_CAST_TITLE()}
            description={LL.VEVOTE_CAST_DESCRIPTION()}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

const DappLogin = ({ activity, onPress, ...props }: OverridableActivityBoxProps<LoginActivity>) => {
    const { LL } = useI18nContext()
    const featuredDapps = useAppSelector(selectFeaturedDapps)

    const onPressHandler = () => {
        onPress(activity)
    }

    const description = useMemo(() => {
        const foundApp = featuredDapps.find(app => URIUtils.compareURLs(app.href, activity.linkUrl))
        return foundApp?.name ?? new URL(activity.linkUrl).hostname
    }, [activity.linkUrl, featuredDapps])

    return (
        <BaseActivityBox
            testID={`DAPP-LOGIN-${activity.id}`}
            icon="icon-user-check"
            timestamp={activity.timestamp}
            title={LL.DAPP_LOGIN_TITLE()}
            description={description}
            onPress={onPressHandler}
            activityStatus={activity.status}
            {...props}
        />
    )
}

export const ActivityBox = {
    TokenTransfer: TokenTransfer,
    DAppTransaction: DAppTransaction,
    NFTTransfer: NFTTransfer,
    NFTSale: NFTSale,
    DAppSignCert: DAppSignCertBox,
    ConnectedAppActivity: ConnectedAppActivityBox,
    SignedTypedData: SignedTypedData,
    Staking: Staking,
    TokenSwap: TokenSwap,
    B3trAction: B3trAction,
    B3trProposalVote: B3trProposalVote,
    B3trXAllocationVote: B3trXAllocationVote,
    B3trClaimReward: B3trClaimReward,
    B3trUpgradeGM: B3trUpgradeGM,
    B3trSwapB3trToVot3: B3trSwapB3trToVot3,
    B3trSwapVot3ToB3tr: B3trSwapVot3ToB3tr,
    B3trProposalSupport: B3trProposalSupport,
    UnknownTx: UnknownTx,
    VeVoteCast,
    DappLogin,
}
