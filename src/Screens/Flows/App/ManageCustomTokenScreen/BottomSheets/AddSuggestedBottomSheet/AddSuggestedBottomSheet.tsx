import React, { Dispatch, SetStateAction, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseText,
    BaseBottomSheet,
    BaseSpacer,
    OfficialTokenCard,
    BaseScrollView,
    BaseButton,
    useThor,
} from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import {
    addTokenBalance,
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    onClose: () => void
    missingSuggestedTokens: FungibleTokenWithBalance[]
    setSelectedTokenSymbols: Dispatch<SetStateAction<string[]>>
}

const snapPoints = ["70%"]

export const AddSuggestedBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, missingSuggestedTokens, setSelectedTokenSymbols }, ref) => {
    const [selectedTokens, setSelectedTokens] = useState<string[]>([])
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
    const thorClient = useThor()

    const toggleToken = (token: FungibleTokenWithBalance) => () => {
        if (selectedTokens.includes(token.symbol)) {
            setSelectedTokens(s =>
                s.filter(selectedToken => selectedToken !== token.symbol),
            )
        } else {
            setSelectedTokens(s => [...s, token.symbol])
        }
    }

    const handleDismiss = () => {
        setSelectedTokens([])
        onClose()
    }

    const handleAddSelectedTokens = async () => {
        for (const tokenAddress of selectedTokens) {
            const token = missingSuggestedTokens.find(
                (missingToken: FungibleTokenWithBalance) =>
                    tokenAddress === missingToken.symbol,
            )
            if (!token) {
                throw new Error(
                    "Trying to select a suggested official token without finding it",
                )
            }

            dispatch(
                addTokenBalance({
                    balance: "0",
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    timeUpdated: new Date().toISOString(),
                    position: tokenBalances.length,
                    genesisId: network.genesis.id,
                }),
            )
            await dispatch(updateAccountBalances(thorClient, account.address))

            handleDismiss()
        }
        setSelectedTokenSymbols((s: string[]) => [...s, ...selectedTokens])
    }

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            contentStyle={styles.contentStyle}
            onDismiss={onClose}>
            <BaseText typographyFont="subTitleBold">
                {LL.MANAGE_TOKEN_TITLE_SUGGESTED_TOKENS()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseScrollView>
                {missingSuggestedTokens.map(
                    (token: FungibleTokenWithBalance) => (
                        <OfficialTokenCard
                            selected={selectedTokens.includes(token.symbol)}
                            key={token.address}
                            token={token}
                            action={toggleToken(token)}
                        />
                    ),
                )}
            </BaseScrollView>
            <BaseSpacer height={24} />
            <BaseButton
                w={100}
                title={LL.COMMON_BTN_ADD()}
                action={handleAddSelectedTokens}
                disabled={!selectedTokens.length}
            />
            <BaseSpacer height={24} />
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    contentStyle: { flex: 1 },
    icon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    inputContainer: {
        width: "100%",
    },
})
