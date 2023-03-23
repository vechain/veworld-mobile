import { getCurrentNetwork } from "~Storage/Redux/Selectors"
import { RootState } from "~Storage/Redux/Types"
import { getAccountFungibleTokens } from "~Storage/Redux/Slices/AccountToken"
import { setTokenBalances, TokenBalance } from "~Storage/Redux/Slices/Balance"
import { Dispatch } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { VET, VTHO } from "~Common/Constant/Token/TokenConstants"
import axios from "axios"
import NetworkService from "~Services/NetworkService"
import { abis } from "~Common/Constant/Thor/ThorConstants"

/**
 * Updates all balances for an account
 * @param accountAddress - the acccount address for this balance
 */
export const updateAccountBalances = (() =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const accountTokens = getAccountFungibleTokens(getState())
        const network = getCurrentNetwork(getState())
        const balances: TokenBalance[] = []

        try {
            for (const accountToken of accountTokens) {
                let balance: string
                if (
                    AddressUtils.compareAddresses(
                        accountToken.address,
                        VET.address,
                    ) ||
                    AddressUtils.compareAddresses(
                        accountToken.address,
                        VTHO.address,
                    )
                ) {
                    const accountResponse =
                        await axios.get<Connex.Thor.Account>(
                            `${network.currentUrl}/accounts/${accountToken.accountAddress}`,
                        )
                    if (
                        AddressUtils.compareAddresses(
                            accountToken.address,
                            VET.address,
                        )
                    ) {
                        balance = accountResponse.data.balance
                    } else {
                        balance = accountResponse.data.energy
                    }
                } else {
                    const thorClient = NetworkService.getConnexThor(network)
                    const res = await thorClient
                        .account(accountToken.address)
                        .method(abis.vip180.balanceOf)
                        .call(accountToken.accountAddress)

                    balance = res.decoded[0]
                }
                balances.push({
                    accountTokenId: accountToken.id,
                    balance,
                    timeUpdated: new Date().toISOString(),
                })
            }
            dispatch(setTokenBalances(balances))
        } catch (e) {
            throw new Error("Failed to get balance from external service")
        }
    }) as any // TODO: remove as any
