import {
    selectAccountBalances,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { RootState, TokenBalance } from "~Storage/Redux/Types"
import { Dispatch } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { VET, VTHO } from "~Common/Constant"
import axios from "axios"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { setTokenBalances } from "~Storage/Redux/Slices"

/**
 * Updates all balances for an account
 * @param accountAddress - the acccount address for this balance
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const accountBalances = selectAccountBalances(getState())
        const network = selectSelectedNetwork(getState())
        const balances: TokenBalance[] = []
        try {
            for (const accountBalance of accountBalances) {
                let balance: string

                if (
                    AddressUtils.compareAddresses(
                        accountBalance.tokenAddress,
                        VET.address,
                    ) ||
                    AddressUtils.compareAddresses(
                        accountBalance.tokenAddress,
                        VTHO.address,
                    )
                ) {
                    const accountResponse =
                        await axios.get<Connex.Thor.Account>(
                            `${network.currentUrl}/accounts/${accountBalance.accountAddress}`,
                        )
                    if (
                        AddressUtils.compareAddresses(
                            accountBalance.tokenAddress,
                            VET.address,
                        )
                    ) {
                        balance = accountResponse.data.balance
                    } else {
                        balance = accountResponse.data.energy
                    }
                } else {
                    const res = await thorClient
                        .account(accountBalance.tokenAddress)
                        .method(abis.vip180.balanceOf)
                        .call(accountBalance.accountAddress)

                    balance = res.decoded[0]
                }

                balances.push({
                    accountAddress: accountBalance.accountAddress,
                    tokenAddress: accountBalance.tokenAddress,
                    balance,
                    timeUpdated: new Date().toISOString(),
                    position: accountBalance.position,
                    networkGenesisId: network.genesisId,
                })
            }
            dispatch(setTokenBalances(balances))
        } catch (e) {
            throw new Error("Failed to get balance from external service")
        }
    }
