import moment from "moment"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView, NFTMedia } from "~Components"
import { B3TR, COLORS, DIRECTIONS, VET, VOT3 } from "~Constants"
import { useNFTInfo, useTheme, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    Activity,
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
    NonFungibleTokenActivity,
    SignCertActivity,
    SwapActivity,
    TransactionOutcomes,
    TypedDataActivity,
    VeBetterDaoDapp,
} from "~Model"
import { selectAllTokens, selectCustomTokens, selectOfficialTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"

type ActivityBoxProps = {
    icon: IconKey
    time: string
    title: string
    description?: string | React.ReactNode
    rightAmount?: string
    rigthAmountDescription?: string | React.ReactNode
    nftImage?: string
    activityStatus?: ActivityStatus
    iconBackgroungColor?: string
    onPress: () => void
    /**
     * If set to true, the title will be lighter than the description. Default is `false`
     */
    invertedStyles?: boolean
}

const BaseActivityBox = ({
    description,
    icon,
    time,
    title,
    rightAmount,
    rigthAmountDescription,
    nftImage,
    iconBackgroungColor = COLORS.GREY_100,
    activityStatus,
    onPress,
    invertedStyles,
}: ActivityBoxProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const showDescription = !!description
    const showActivityStatus = !!activityStatus && activityStatus !== ActivityStatus.SUCCESS
    const showRightAmount = !!rightAmount
    const showRigthAmountDescription = !!rigthAmountDescription
    const showNftImage = !!nftImage

    const renderRightElement = () => {
        if (!nftImage && !rightAmount && !rigthAmountDescription) {
            return null
        }

        if (showNftImage) {
            return <NFTMedia uri={nftImage ?? ""} styles={styles.rightImageContainer} />
        }

        return (
            <BaseView flexDirection="column" gap={2} style={styles.rightTextContainer}>
                {showRightAmount && (
                    <BaseText typographyFont="bodySemiBold" numberOfLines={1} color={theme.colors.activityCard.title}>
                        {rightAmount}
                    </BaseText>
                )}
                {showRigthAmountDescription &&
                    (typeof rigthAmountDescription === "string" ? (
                        <BaseText
                            typographyFont="smallCaptionMedium"
                            numberOfLines={1}
                            color={theme.colors.activityCard.title}>
                            {rigthAmountDescription}
                        </BaseText>
                    ) : (
                        rigthAmountDescription
                    ))}
            </BaseView>
        )
    }

    return (
        <BaseCard style={styles.rootContainer} onPress={onPress}>
            <BaseView style={[styles.iconContainer, { backgroundColor: iconBackgroungColor }]}>
                <BaseIcon name={icon} size={16} color={COLORS.DARK_PURPLE} testID="magnify" bg={iconBackgroungColor} />
            </BaseView>

            <BaseSpacer width={16} />

            <BaseView style={styles.textContainer}>
                <BaseText typographyFont="captionRegular" color={theme.colors.activityCard.time}>
                    {time}
                </BaseText>
                <BaseSpacer height={2} />
                <BaseView style={styles.titleContainer}>
                    <BaseText
                        typographyFont={invertedStyles ? "body" : "bodySemiBold"}
                        numberOfLines={1}
                        color={
                            invertedStyles ? theme.colors.activityCard.subtitleBold : theme.colors.activityCard.title
                        }>
                        {title}
                    </BaseText>
                    {showActivityStatus && <ActivityStatusIndicator activityStatus={ActivityStatus.REVERTED} />}
                </BaseView>
                <BaseSpacer height={2} />
                {showDescription && (
                    <BaseText
                        typographyFont={invertedStyles ? "bodySemiBold" : "body"}
                        numberOfLines={1}
                        color={
                            invertedStyles ? theme.colors.activityCard.title : theme.colors.activityCard.subtitleBold
                        }>
                        {description}
                    </BaseText>
                )}
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
            flex: 1,
            width: "100%",
        },
        textContainer: {
            flex: 1,
            height: "100%",
            alignContent: "center",
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

type TokenTransferActivityBoxProps = {
    activity: FungibleTokenActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const TokenTransfer = ({ activity, onPress }: TokenTransferActivityBoxProps) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { amount, timestamp, tokenAddress, direction, to, from } = activity

    const type = direction === DIRECTIONS.UP ? "sent" : "received"

    const { name, address } = useVns({
        address: DIRECTIONS.UP ? to?.[0] ?? "" : from,
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

    const time = moment(timestamp).format("HH:mm")

    const getAmountTransferred = () => {
        if (!token?.decimals) {
            return "0"
        }

        return BigNutils(amount)
            .toHuman(token?.decimals ?? 0)
            .toTokenFormat_string(2)
    }

    const getActivityProps = (): Omit<ActivityBoxProps, "time" | "onPress"> => {
        const amountToDisplay = getAmountTransferred()

        switch (type) {
            case "received":
                return {
                    title: LL.TOKEN_TRANSFER_RECEIVED(),
                    description: (
                        <>
                            <BaseText
                                typographyFont="body"
                                color={theme.colors.activityCard.subtitleLight}
                                textTransform="lowercase">
                                {LL.FROM()}{" "}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.activityCard.subtitleBold}>
                                {addressOrUsername}
                            </BaseText>
                        </>
                    ),
                    rightAmount: `${DIRECTIONS.UP} ${amountToDisplay}`,
                    rigthAmountDescription: token?.symbol ?? "",
                    icon: "icon-arrow-down",
                }
            case "sent":
                return {
                    title: LL.TOKEN_TRANSFER_SENT(),
                    description: (
                        <>
                            <BaseText
                                typographyFont="body"
                                color={theme.colors.activityCard.subtitleLight}
                                textTransform="lowercase">
                                {LL.TO()}{" "}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.activityCard.subtitleBold}>
                                {addressOrUsername}
                            </BaseText>
                        </>
                    ),
                    rightAmount: `${DIRECTIONS.DOWN} ${amountToDisplay}`,
                    rigthAmountDescription: token?.symbol ?? "",
                    icon: "icon-arrow-up",
                }
        }
    }

    const onPressHandler = () => {
        onPress(activity, token)
    }

    return <BaseActivityBox time={time} onPress={onPressHandler} {...getActivityProps()} />
}

type TokenSwapProps = {
    activity: SwapActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const TokenSwap = ({ activity, onPress }: TokenSwapProps) => {
    const { LL } = useI18nContext()

    const title = LL.DAPP_TRANSACTION_SWAP()
    const icon = "icon-arrow-left-right"
    const time = moment(activity.timestamp).format("HH:mm")
    const theme = useTheme()

    const allTokens = useAppSelector(selectAllTokens)
    const outputToken = allTokens.find(_token => AddressUtils.compareAddresses(_token.address, activity.outputToken))
    const inputToken = allTokens.find(_token => AddressUtils.compareAddresses(_token.address, activity.inputToken))

    const paidAmount = BigNutils(activity.inputValue)
        .toHuman(inputToken?.decimals ?? 0)
        .toTokenFormat_string(2)

    const receivedAmount = BigNutils(activity.outputValue)
        .toHuman(outputToken?.decimals ?? 0)
        .toTokenFormat_string(2)

    const rightAmount = `${DIRECTIONS.UP} ${receivedAmount} ${outputToken?.symbol ?? ""}`
    const rigthAmountDescription = `${DIRECTIONS.DOWN} ${paidAmount} ${inputToken?.symbol ?? ""}`

    const onSwapPressHandler = () => {
        onPress(activity, undefined, true)
    }

    return (
        <BaseActivityBox
            icon={icon}
            time={time}
            title={title}
            rightAmount={rightAmount}
            rigthAmountDescription={
                <BaseText typographyFont="smallCaptionMedium" numberOfLines={1} color={theme.colors.activityCard.swap}>
                    {rigthAmountDescription}
                </BaseText>
            }
            onPress={onSwapPressHandler}
        />
    )
}

type DAppTransactionProps = {
    activity: DappTxActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const DAppTransaction = ({ activity, onPress }: DAppTransactionProps) => {
    const { LL } = useI18nContext()

    const time = moment(activity.timestamp).format("HH:mm")

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
            icon="icon-layout-grid"
            time={time}
            title={title}
            description={
                <>
                    <BaseText
                        typographyFont="body"
                        color={theme.colors.activityCard.subtitleLight}
                        textTransform="lowercase">
                        {LL.TO()}{" "}
                    </BaseText>
                    <BaseText typographyFont="bodyMedium" color={theme.colors.activityCard.subtitleBold}>
                        {description}
                    </BaseText>
                </>
            }
            onPress={onPressHandler}
            activityStatus={activity.status}
        />
    )
}

type DAppSignCert = {
    activity: SignCertActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const DAppSignCertBox = ({ activity, onPress }: DAppSignCert) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")
    const title = LL.DAPP_SIGN_CERT()
    const description = activity?.name

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-edit-2"
            time={time}
            title={title}
            description={description}
            onPress={onPressHandler}
        />
    )
}

type NFTTransferActivityBoxProps = {
    activity: NonFungibleTokenActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const NFTTransfer = ({ activity, onPress }: NFTTransferActivityBoxProps) => {
    const { LL } = useI18nContext()
    const { collectionName } = useNFTInfo(activity?.tokenId, activity.contractAddress)
    const isReceived = activity.direction === DIRECTIONS.DOWN
    const title = isReceived ? LL.NFT_TRANSFER_RECEIVED() : LL.NFT_TRANSFER_SENT()
    const time = moment(activity.timestamp).format("HH:mm")

    const validatedCollectionName = () => {
        if (!collectionName) return LL.UNKNOWN_COLLECTION()
        return collectionName
    }

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-image"
            time={time}
            title={title}
            description={validatedCollectionName()}
            onPress={onPressHandler}
        />
    )
}

type ConnectedAppActivityProps = {
    activity: ConnectedAppActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const ConnectedAppActivityBox = ({ activity, onPress }: ConnectedAppActivityProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    return <BaseActivityBox icon="icon-laptop" time={time} title={LL.CONNECTED_APP_TITLE()} onPress={onPressHandler} />
}

type SignedTypedDataProps = {
    activity: TypedDataActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const SignedTypedData = ({ activity, onPress }: SignedTypedDataProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-check-check"
            time={time}
            title={LL.CONNECTED_APP_SIGN_TYPED_DATA()}
            onPress={onPressHandler}
        />
    )
}

type B3trActionProps = {
    activity: B3trActionActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
    veBetterDaoDapps: VeBetterDaoDapp[]
}

const B3trAction = ({ activity, onPress, veBetterDaoDapps }: B3trActionProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    const dapp = veBetterDaoDapps.find(d => d.id === activity.appId)
    const rewardValue = BigNutils(activity.value).toHuman(B3TR.decimals).toTokenFormat_string(2)

    return (
        <BaseActivityBox
            icon="icon-leaf"
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={LL.B3TR_ACTION()}
            description={dapp?.name}
            onPress={onPressHandler}
            rightAmount={`${DIRECTIONS.UP} ${rewardValue}`}
            rigthAmountDescription={B3TR.symbol}
            invertedStyles
        />
    )
}

type B3trPrpoposalVoteProps = {
    activity: B3trProposalVoteActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trProposalVote = ({ activity, onPress }: B3trPrpoposalVoteProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-vote"
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={LL.B3TR_PROPOSAL_VOTE()}
            onPress={onPressHandler}
        />
    )
}

type B3trXAllocartionVoteProps = {
    activity: B3trXAllocationVoteActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trXAllocationVote = ({ activity, onPress }: B3trXAllocartionVoteProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-vote"
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={LL.B3TR_XALLOCATION_VOTE({ number: parseInt(activity.roundId, 10) })}
            onPress={onPressHandler}
        />
    )
}

type B3trClaimRewardProps = {
    activity: B3trClaimRewardActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trClaimReward = ({ activity, onPress }: B3trClaimRewardProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    const rewardValue = BigNutils(activity.value).toHuman(B3TR.decimals).toTokenFormat_string(2)

    return (
        <BaseActivityBox
            icon="icon-leaf"
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={LL.B3TR_CLAIM_REWARD()}
            onPress={onPressHandler}
            rightAmount={`${DIRECTIONS.UP} ${rewardValue}`}
            rigthAmountDescription={B3TR.symbol}
        />
    )
}

type B3trUpgradeGMProps = {
    activity: B3trUpgradeGmActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trUpgradeGM = ({ activity, onPress }: B3trUpgradeGMProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-vote"
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={LL.B3TR_UPGRADE_GM()}
            description={activity.newLevel}
            onPress={onPressHandler}
        />
    )
}

type B3trSwapB3trToVot3Props = {
    activity: B3trSwapB3trToVot3Activity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trSwapB3trToVot3 = ({ activity, onPress }: B3trSwapB3trToVot3Props) => {
    const { LL } = useI18nContext()

    const title = LL.TOKEN_CONVERSION()
    const time = moment(activity.timestamp).format("HH:mm")
    const theme = useTheme()

    const amount = BigNutils(activity.value)
        .toHuman(B3TR.decimals ?? 0)
        .toTokenFormat_string(2)

    const rightAmount = `${DIRECTIONS.UP} ${amount} ${VOT3.symbol}`
    const rigthAmountDescription = `${DIRECTIONS.DOWN}  ${amount} ${B3TR.symbol}`

    const onSwapPressHandler = () => {
        onPress(activity, undefined, true)
    }

    return (
        <BaseActivityBox
            icon={"icon-convert"}
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={title}
            rightAmount={rightAmount}
            rigthAmountDescription={
                <BaseText typographyFont="smallCaptionMedium" numberOfLines={1} color={theme.colors.activityCard.swap}>
                    {rigthAmountDescription}
                </BaseText>
            }
            onPress={onSwapPressHandler}
        />
    )
}

type B3trSwapVot3ToB3trProps = {
    activity: B3trSwapVot3ToB3trActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trSwapVot3ToB3tr = ({ activity, onPress }: B3trSwapVot3ToB3trProps) => {
    const { LL } = useI18nContext()

    const title = LL.TOKEN_CONVERSION()
    const time = moment(activity.timestamp).format("HH:mm")
    const theme = useTheme()

    const amount = BigNutils(activity.value)
        .toHuman(B3TR.decimals ?? 0)
        .toTokenFormat_string(2)

    const rightAmount = `${DIRECTIONS.UP} ${amount} ${B3TR.symbol}`
    const rigthAmountDescription = `${DIRECTIONS.DOWN}  ${amount} ${VOT3.symbol}`

    const onSwapPressHandler = () => {
        onPress(activity, undefined, true)
    }

    return (
        <BaseActivityBox
            icon={"icon-convert"}
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={title}
            rightAmount={rightAmount}
            rigthAmountDescription={
                <BaseText typographyFont="smallCaptionMedium" numberOfLines={1} color={theme.colors.activityCard.swap}>
                    {rigthAmountDescription}
                </BaseText>
            }
            onPress={onSwapPressHandler}
        />
    )
}

type B3trProposalSupportProps = {
    activity: B3trProposalSupportActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const B3trProposalSupport = ({ activity, onPress }: B3trProposalSupportProps) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")

    const onPressHandler = () => {
        onPress(activity)
    }

    return (
        <BaseActivityBox
            icon="icon-vote"
            iconBackgroungColor={COLORS.B3TR_ICON_BACKGROUND}
            time={time}
            title={LL.B3TR_PROPSAL_SUPPORT()}
            description={activity.proposalId}
            onPress={onPressHandler}
        />
    )
}

export const ActivityBox = {
    TokenTransfer: TokenTransfer,
    DAppTransaction: DAppTransaction,
    NFTTransfer: NFTTransfer,
    DAppSignCert: DAppSignCertBox,
    ConnectedAppActivity: ConnectedAppActivityBox,
    SignedTypedData: SignedTypedData,
    TokenSwap: TokenSwap,
    B3trAction: B3trAction,
    B3trProposalVote: B3trProposalVote,
    B3trXAllocationVote: B3trXAllocationVote,
    B3trClaimReward: B3trClaimReward,
    B3trUpgradeGM: B3trUpgradeGM,
    B3trSwapB3trToVot3: B3trSwapB3trToVot3,
    B3trSwapVot3ToB3tr: B3trSwapVot3ToB3tr,
    B3trProposalSupport: B3trProposalSupport,
}
