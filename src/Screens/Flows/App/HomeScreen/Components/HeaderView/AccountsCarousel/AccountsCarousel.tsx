import React, { memo, useCallback, useMemo } from "react"
import Carousel from "react-native-reanimated-carousel"
import { FadeIn, FadeInRight, useSharedValue } from "react-native-reanimated"
import { StyleSheet, Dimensions } from "react-native"
import { PaginationItem, BaseSpacer, BaseView } from "~Components"
import { AccountCard } from "./AccountCard"
import { Account } from "~Storage"
import { useUserPreferencesEntity } from "~Common/Hooks/Entities"

const width = Dimensions.get("window").width - 40

const StackConfig = {
    showLength: 3,
    stackInterval: 15,
    rotateZDeg: 0,
    scaleInterval: 0.05,
    opacityInterval: 0.5,
}

type Props = {
    accounts: Account[]
    selectedAccountIndex: number
    onAccountChange: (account: Account) => void
    openAccountManagementSheet: () => void
}

export const AccountsCarousel: React.FC<Props> = memo(
    ({
        accounts,
        selectedAccountIndex,
        onAccountChange,
        openAccountManagementSheet,
    }) => {
        const progressValue = useSharedValue<number>(selectedAccountIndex)
        const { userPreferencesEntity } = useUserPreferencesEntity()

        const onSnapToItem = useCallback(
            (absoluteProgress: number) => {
                onAccountChange(accounts[absoluteProgress])
            },
            [onAccountChange, accounts],
        )

        const onProgressChange = useCallback(
            (_: number, absoluteProgress: number) => {
                progressValue.value = absoluteProgress
            },
            [progressValue],
        )

        const renderItem = useCallback(
            ({ index }: { index: number }) => {
                return (
                    <AccountCard
                        openAccountManagement={openAccountManagementSheet}
                        userPreferencesEntity={userPreferencesEntity}
                        account={accounts[index]}
                        key={index}
                        entering={FadeInRight.delay(
                            (accounts.length - index) * 50,
                        ).duration(200)}
                    />
                )
            },
            [accounts, openAccountManagementSheet, userPreferencesEntity],
        )

        const paginationAnim = useMemo(() => FadeIn.delay(200), [])

        return (
            <>
                <Carousel
                    loop={false}
                    style={baseStyles.carouselContainer}
                    width={width}
                    height={180}
                    pagingEnabled={true}
                    snapEnabled={true}
                    scrollAnimationDuration={1000}
                    mode="horizontal-stack"
                    data={accounts}
                    modeConfig={StackConfig}
                    defaultIndex={selectedAccountIndex}
                    onProgressChange={onProgressChange}
                    renderItem={renderItem}
                    onSnapToItem={onSnapToItem}
                />

                <BaseSpacer height={10} />

                {!!progressValue && (
                    <BaseView
                        orientation="row"
                        justify="space-between"
                        selfAlign="center">
                        {accounts.map((account, index) => (
                            <PaginationItem
                                animValue={progressValue}
                                index={index}
                                key={account.address}
                                length={accounts.length}
                                entering={paginationAnim}
                            />
                        ))}
                    </BaseView>
                )}
            </>
        )
    },
)

const baseStyles = StyleSheet.create({
    carouselContainer: {
        width: "100%",
        height: 190,
        alignItems: "center",
        justifyContent: "center",
    },
})
