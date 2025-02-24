import moment from "moment"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView, NFTMedia } from "~Components"
import { useSwappedTokens } from "~Components/Reusable/SwapCard/Hooks"
import { COLORS, DIRECTIONS, VET } from "~Constants"
import { useFungibleTokenInfo, useNFTInfo, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    Activity,
    ActivityStatus,
    ActivityType,
    ConnectedAppActivity,
    DappTxActivity,
    FungibleToken,
    FungibleTokenActivity,
    IconKey,
    NonFungibleTokenActivity,
    SignCertActivity,
    TransactionOutcomes,
    TypedDataActivity,
} from "~Model"
import { selectCustomTokens, selectOfficialTokens, useAppSelector } from "~Storage/Redux"
import { BigNutils, TransactionUtils } from "~Utils"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"

type ActivityBoxProps = {
    icon: IconKey
    time: string
    title: string
    description?: string
    rightAmount?: string
    rigthAmountDescription?: string
    nftImage?: string
    activityStatus?: ActivityStatus
    onPress: () => void
}

const BaseActivityBox = ({
    description,
    icon,
    time,
    title,
    rightAmount,
    rigthAmountDescription,
    activityStatus,
    nftImage,
    onPress,
}: ActivityBoxProps) => {
    const { styles } = useThemedStyles(baseStyles)

    const showDescription = !!description
    const showActivityStatus = !!activityStatus && activityStatus !== ActivityStatus.SUCCESS
    const showRightAmount = !!rightAmount
    const showRigthAmountDescription = !!rigthAmountDescription
    const showNftImage = !!nftImage

    const renderRigthElement = () => {
        if (!nftImage && !rightAmount && !rigthAmountDescription) {
            return null
        }

        if (showNftImage) {
            return <NFTMedia uri={nftImage ?? ""} styles={styles.rightImageContainer} />
        }

        return (
            <BaseView style={styles.rightTextContainer}>
                {showRightAmount && (
                    <BaseText typographyFont="bodySemiBold" numberOfLines={1}>
                        {rightAmount}
                    </BaseText>
                )}
                <BaseSpacer height={2} />
                {showRigthAmountDescription && (
                    <BaseText typographyFont="smallCaptionRegular" numberOfLines={1}>
                        {rigthAmountDescription}
                    </BaseText>
                )}
            </BaseView>
        )
    }

    return (
        <BaseCard style={styles.rootContainer} onPress={onPress}>
            <BaseView style={styles.iconContainer}>
                <BaseIcon name={icon} size={16} color={COLORS.DARK_PURPLE} testID="magnify" bg={COLORS.GREY_100} />
            </BaseView>

            <BaseSpacer width={16} />

            <BaseView style={styles.textContainer}>
                <BaseText typographyFont="captionRegular">{time}</BaseText>
                <BaseSpacer height={2} />
                <BaseView style={styles.titleContainer}>
                    <BaseText typographyFont="bodySemiBold" numberOfLines={1}>
                        {title}
                    </BaseText>
                    {showActivityStatus && <ActivityStatusIndicator activityStatus={activityStatus} />}
                </BaseView>
                <BaseSpacer height={2} />
                {showDescription && (
                    <BaseText typographyFont="captionRegular" numberOfLines={1}>
                        {description}
                    </BaseText>
                )}
            </BaseView>

            <BaseSpacer width={8} />

            {renderRigthElement()}
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
            backgroundColor: COLORS.GREY_100,
        },
        titleContainer: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            width: "100%",
        },
        textContainer: {
            flex: 2,
            height: "100%",
            alignContent: "center",
        },
        rightTextContainer: {
            alignItems: "flex-end",
            flex: 1,
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

    const { amount, timestamp, tokenAddress, direction, status, to, from } = activity

    const type = direction === DIRECTIONS.UP ? "sent" : "received"
    const addressOrUsername = direction === DIRECTIONS.UP ? to?.[0] ?? "" : from

    const customTokens = useAppSelector(selectCustomTokens)
    const officialTokens = useAppSelector(selectOfficialTokens)

    const { decimals } = useFungibleTokenInfo(activity.tokenAddress)

    const allTokens = [customTokens, officialTokens].flat()
    const token = allTokens.find(_token => _token.address === tokenAddress)
    const time = moment(timestamp).format("HH:mm")

    const getAmountTransferred = () => {
        if (!token?.decimals && !decimals) return ""

        return BigNutils(amount)
            .toHuman(token?.decimals ?? decimals ?? 0)
            .toTokenFormat_string(2)
    }

    const getActivityProps = (): {
        title: string
        description?: string
        rightAmount: string
        rigthAmountDescription: string
        icon: IconKey
    } => {
        const amountToDisplay = getAmountTransferred()

        switch (type) {
            case "received":
                return {
                    title: LL.TOKEN_TRANSFER_RECEIVED(),
                    description: `from ${addressOrUsername}`,
                    rightAmount: `${DIRECTIONS.UP} ${amountToDisplay}`,
                    rigthAmountDescription: token?.symbol ?? "",
                    icon: "icon-arrow-down",
                }
            case "sent":
                return {
                    title: LL.TOKEN_TRANSFER_SENT(),
                    description: `to ${addressOrUsername}`,
                    rightAmount: `${DIRECTIONS.DOWN} ${amountToDisplay}`,
                    rigthAmountDescription: token?.symbol ?? "",
                    icon: "icon-arrow-up",
                }
        }
    }

    const onPressHandler = () => {
        onPress(activity, token)
    }

    return <BaseActivityBox time={time} activityStatus={status} onPress={onPressHandler} {...getActivityProps()} />
}

type DAppTransactionProps = {
    activity: DappTxActivity
    tokens: FungibleToken[]
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const DAppTransaction = ({ activity, tokens, onPress }: DAppTransactionProps) => {
    const { LL } = useI18nContext()
    const decodedClauses = TransactionUtils.interpretClauses(activity.clauses ?? [], tokens)
    const isSwap = TransactionUtils.isSwapTransaction(decodedClauses)

    const getSwapResult = () => {
        if (!isSwap || !decodedClauses || activity.type !== ActivityType.DAPP_TRANSACTION) return undefined
        return TransactionUtils.decodeSwapTransferAmounts(decodedClauses, activity)
    }

    const swapResult = getSwapResult()

    const { paidToken, receivedToken } = useSwappedTokens(
        swapResult?.receivedTokenAddress ?? VET.address,
        swapResult?.paidTokenAddress ?? VET.address,
    )

    const time = moment(activity.timestamp).format("HH:mm")
    const status = activity.status

    if (isSwap && swapResult) {
        const title = LL.DAPP_TRANSACTION_SWAP()
        const icon = "icon-arrow-left-right"

        const onSwapPressHandler = () => {
            onPress(activity, undefined, true, decodedClauses)
        }

        const paidAmount = BigNutils(swapResult?.paidAmount)
            .toHuman(paidToken?.decimals ?? 0)
            .toTokenFormat_string(2)

        const receivedAmount = BigNutils(swapResult?.receivedAmount)
            .toHuman(receivedToken?.decimals ?? 0)
            .toTokenFormat_string(2)

        const rightAmount = `${DIRECTIONS.UP} ${paidAmount} ${paidToken?.symbol ?? ""}`
        const rigthAmountDescription = `${DIRECTIONS.DOWN}  ${receivedAmount} ${receivedToken?.symbol ?? ""}`

        return (
            <BaseActivityBox
                icon={icon}
                time={time}
                activityStatus={status}
                title={title}
                rightAmount={rightAmount}
                rigthAmountDescription={rigthAmountDescription}
                onPress={onSwapPressHandler}
            />
        )
    } else {
        const title = activity.isTransaction ? LL.DAPP_TRANSACTION_TITLE() : LL.DAPP_CONNECTION()
        const description = activity.isTransaction ? `from ${activity.from}` : `to ${activity.name}`

        const onPressHandler = () => {
            onPress(activity)
        }

        return (
            <BaseActivityBox
                icon="icon-layout-grid"
                time={time}
                title={title}
                description={description}
                onPress={onPressHandler}
            />
        )
    }
}

type DAppSignCert = {
    activity: SignCertActivity
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}

const DAppSignCertBox = ({ activity, onPress }: DAppSignCert) => {
    const { LL } = useI18nContext()
    const time = moment(activity.timestamp).format("HH:mm")
    const title = LL.DAPP_SIGN_CERT()
    const description = activity.name

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
    const { collectionName } = useNFTInfo(activity.tokenId, activity.contractAddress)
    const isReceived = activity.direction === DIRECTIONS.DOWN
    const title = isReceived ? LL.NFT_TRANSFER_RECEIVED() : LL.NFT_TRANSFER_SENT()
    const time = moment(activity.timestamp).format("HH:mm")

    const validatedCollectionName = () => {
        if (!collectionName) return LL.UNKNOWN_COLLECTION()
        return collectionName.length > 13 ? `${collectionName.slice(0, 12)}...` : collectionName
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
            activityStatus={activity.status}
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

    return (
        <BaseActivityBox
            icon="icon-laptop"
            time={time}
            title={LL.CONNECTED_APP_TITLE()}
            activityStatus={activity.status}
            onPress={onPressHandler}
        />
    )
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
            activityStatus={activity.status}
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
}
