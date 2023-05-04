import React, { memo, useCallback, useState } from "react"
import Carousel from "react-native-reanimated-carousel"
import { FadeInRight } from "react-native-reanimated"
import { StyleSheet, Dimensions } from "react-native"
import { BaseSpacer, PaginatedDot } from "~Components"
import { AccountCard } from "./AccountCard"
import { useTheme, valueToHP } from "~Common"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { useAppSelector } from "~Storage/Redux"
import { WalletAccount } from "~Model"

const width = Dimensions.get("window").width - 40

const StackConfig = {
    showLength: 3,
    stackInterval: 15,
    rotateZDeg: 0,
    scaleInterval: 0.05,
    opacityInterval: 0.5,
}

type Props = {
    accounts: WalletAccount[]
    selectedAccountIndex: number
    onAccountChange: (account: WalletAccount) => void
    openAccountManagementSheet: () => void
    balanceVisible: boolean
}

export const AccountsCarousel: React.FC<Props> = memo(
    ({
        accounts,
        selectedAccountIndex,
        onAccountChange,
        openAccountManagementSheet,
        balanceVisible,
    }) => {
        const theme = useTheme()

        //Current index of the carousel (used for pagination, faster than using the selectedAccountIndex)
        const [currentIndex, setCurrentIndex] = useState(selectedAccountIndex)

        const onSnapToItem = useCallback(
            (absoluteProgress: number) => {
                onAccountChange(accounts[absoluteProgress])
            },
            [onAccountChange, accounts],
        )

        const onProgressChange = useCallback(
            (_: number, absoluteProgress: number) => {
                const integerProgress = Math.round(absoluteProgress)
                if (currentIndex !== integerProgress)
                    setCurrentIndex(integerProgress)
            },
            [currentIndex],
        )

        const selectedCurrency = useAppSelector(selectCurrency)

        const renderItem = useCallback(
            ({ index }: { index: number }) => {
                return (
                    <AccountCard
                        balanceVisible={balanceVisible}
                        openAccountManagement={openAccountManagementSheet}
                        account={accounts[index]}
                        key={index}
                        entering={FadeInRight.delay(
                            (accounts.length - index) * 50,
                        ).duration(200)}
                        selectedCurrency={selectedCurrency}
                    />
                )
            },
            [
                accounts,
                balanceVisible,
                openAccountManagementSheet,
                selectedCurrency,
            ],
        )

        return (
            <>
                <Carousel
                    loop={false}
                    style={baseStyles.carouselContainer}
                    width={width}
                    height={valueToHP[190]}
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

                <PaginatedDot
                    activeDotColor={theme.colors.primary}
                    inactiveDotColor={theme.colors.primary}
                    pageIdx={currentIndex}
                    maxPage={accounts.length}
                />
            </>
        )
    },
)

const baseStyles = StyleSheet.create({
    carouselContainer: {
        width: "100%",
        height: valueToHP[190] < 190 ? 190 : valueToHP[190],
        alignItems: "center",
        justifyContent: "center",
    },
})
