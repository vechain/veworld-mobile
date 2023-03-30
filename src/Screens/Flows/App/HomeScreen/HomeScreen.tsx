import React, { useRef, useState, useEffect } from "react"
import {
    AddAccountBottomSheet,
    TokenList,
    HeaderView,
    AccountManagementBottomSheet,
    EditTokensBar,
} from "./Components"
import { useBottomSheetModal, useMemoizedAnimation } from "~Common"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import {
    BaseSafeArea,
    useThor,
    useUserPreferencesEntity,
    BaseSpacer,
} from "~Components"
import { Routes } from "~Navigation"
import { getTokensFromGithub } from "./Utils/getTokensFromGithub"
import { FungibleToken, Network, NETWORK_TYPE } from "~Model"
import { updateFungibleTokens } from "~Storage/Redux/Slices/Token"
import { setSelectedAccount } from "~Storage/Redux/Actions"
import { useAppDispatch } from "~Storage/Redux"
import { SlideInLeft } from "react-native-reanimated"
import {
    defaultTokensMain,
    defaultTokensTest,
} from "~Common/Constant/Token/TokenConstants"
import { updateAccountBalances } from "~Services/BalanceService/BalanceService"
import { setTokenBalances } from "~Storage/Redux/Slices"
import { mergeTokens } from "~Common/Utils/TokenUtils"

export const HomeScreen = () => {
    const {
        ref: accountManagementBottomSheetRef,
        onOpen: openAccountManagementSheet,
        onClose: closeAccountManagementSheet,
    } = useBottomSheetModal()

    const {
        ref: addAccountBottomSheetRef,
        onOpen: openAddAccountSheet,
        onClose: closeAddAccountSheet,
    } = useBottomSheetModal()

    const { animateEntering, animateExiting } = useMemoizedAnimation({
        enteringAnimation: new SlideInLeft(),
        enteringDelay: 200,
        enteringDuration: 200,
        exitingAnimation: new SlideInLeft(),
        exitingDelay: 0,
        exitingDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const paddingBottom = useBottomTabBarHeight()
    const visibleHeightRef = useRef<number>(0)
    const isFocused = useIsFocused()
    const thorClient = useThor()

    const nav = useNavigation()
    const { currentNetwork, selectedAccount } = useUserPreferencesEntity()
    const dispatch = useAppDispatch()

    useEffect(() => {
        async function init() {
            const genesis = thorClient.genesis.id
            console.log("genesis number", genesis)
        }
        init()
    }, [isFocused, thorClient])

    useEffect(() => {
        if (selectedAccount)
            dispatch(
                setSelectedAccount({
                    // TODO: change to the real account
                    address: selectedAccount.address,
                    alias: selectedAccount.alias,
                    createdAt: selectedAccount.createdAt,
                    index: selectedAccount.index,
                    visible: true,
                    rootAddress: "0x0000000",
                }),
            )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount?.address, dispatch])

    /**
     * init tokens and balances
     */
    useEffect(() => {
        if (selectedAccount?.address && currentNetwork.genesisId) {
            getTokensFromGithub({
                genesis: { id: currentNetwork.genesisId },
                type: currentNetwork.type,
            } as Network).then(_tokens => {
                let defaultTokens: FungibleToken[] = []
                if (currentNetwork.type === NETWORK_TYPE.MAIN) {
                    defaultTokens = defaultTokensMain
                }
                if (currentNetwork.type === NETWORK_TYPE.TEST) {
                    defaultTokens = defaultTokensTest
                }

                if (defaultTokens.length) {
                    // set tokens
                    dispatch(
                        updateFungibleTokens(
                            mergeTokens(defaultTokens, _tokens),
                        ),
                    )
                    // set balances
                    dispatch(
                        setTokenBalances(
                            defaultTokens.map(token => ({
                                accountAddress: selectedAccount?.address,
                                tokenAddress: token.address,
                                balance: "0",
                                timeUpdated: new Date().toISOString(),
                            })),
                        ),
                    )
                    dispatch(updateAccountBalances(thorClient))
                } else {
                    dispatch(updateFungibleTokens(_tokens))
                }
            })
        }
    }, [
        currentNetwork.genesisId,
        currentNetwork.type,
        selectedAccount?.address,
        dispatch,
        thorClient,
    ])

    return (
        <BaseSafeArea grow={1}>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <HeaderView
                    openAccountManagementSheet={openAccountManagementSheet}
                />
                <BaseSpacer height={24} />
                <EditTokensBar
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    handleAddToken={() => nav.navigate(Routes.ADD_TOKEN)}
                />
                <BaseSpacer height={24} />
                <TokenList
                    isEdit={isEdit}
                    visibleHeightRef={visibleHeightRef.current}
                    entering={animateEntering}
                    exiting={animateExiting}
                />
            </NestableScrollContainer>

            <AccountManagementBottomSheet
                ref={accountManagementBottomSheetRef}
                onClose={closeAccountManagementSheet}
                openAddAccountSheet={openAddAccountSheet}
            />
            <AddAccountBottomSheet
                ref={addAccountBottomSheetRef}
                onClose={closeAddAccountSheet}
            />
        </BaseSafeArea>
    )
}
