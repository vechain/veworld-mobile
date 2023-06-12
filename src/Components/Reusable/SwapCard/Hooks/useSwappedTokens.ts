import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react"
import { VET } from "~Constants"
import { useThor } from "~Components"
import { FungibleToken, Token } from "~Model"
import { getCustomTokenInfo } from "~Screens/Flows/App/ManageCustomTokenScreen/Utils"
import {
    selectSelectedNetwork,
    selectTokenWithInfoWithID,
    selectTokensWithInfo,
    useAppSelector,
} from "~Storage/Redux"

/**
 * Custom React hook to fetch and set the details for paid and received tokens in a token swap operation.
 *
 * @param receivedTokenAddress - The address of the token to be received in the swap operation.
 * @param paidTokenAddress - The address of the token to be paid in the swap operation.
 *
 * @returns An object containing:
 * - paidToken: The FungibleToken object for the paid token, or undefined if not yet set or not found.
 * - receivedToken: The FungibleToken object for the received token, or undefined if not yet set or not found.
 * - tokens: An array of all available Token objects, fetched from the Redux store.
 *
 * @remarks
 * This hook uses the useThor and useAppSelector hooks from the application's components and Redux store, respectively.
 * If the token addresses given correspond to the VeChain token (VET), the hook will automatically use the details
 * for VET fetched from the Redux store. Otherwise, it attempts to find the token in the list of all tokens, and if not found,
 * it fetches the token info using the getCustomTokenInfo utility function.
 *
 */
export const useSwappedTokens = (
    receivedTokenAddress: string,
    paidTokenAddress: string,
) => {
    const vetToken = useAppSelector(state =>
        selectTokenWithInfoWithID(state, [VET.symbol]),
    )[0]

    const tokens = useAppSelector(selectTokensWithInfo)

    const network = useAppSelector(selectSelectedNetwork)

    const thor = useThor()

    const [paidToken, setPaidToken] = useState<FungibleToken | undefined>(
        undefined,
    )
    const [receivedToken, setReceivedToken] = useState<
        FungibleToken | undefined
    >(undefined)

    const getToken = useCallback(
        async (
            tokenAddress: string,
            setState: Dispatch<SetStateAction<FungibleToken | undefined>>,
        ) => {
            if (tokenAddress === VET.address) {
                setState(vetToken)
                return
            }

            let token = tokens.find(
                (tkn: Token) =>
                    tkn.address.toLowerCase() === tokenAddress.toLowerCase(),
            )

            if (!token) {
                token = await getCustomTokenInfo({
                    network,
                    tokenAddress: tokenAddress,
                    thorClient: thor,
                })
            }

            setState(token)
        },
        [network, thor, tokens, vetToken],
    )

    useEffect(() => {
        getToken(paidTokenAddress, setPaidToken)
        getToken(receivedTokenAddress, setReceivedToken)
    }, [
        getToken,
        network,
        paidTokenAddress,
        receivedTokenAddress,
        thor,
        tokens,
        vetToken,
    ])

    return { paidToken, receivedToken }
}
