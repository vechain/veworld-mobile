import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { getSelectedAccount } from "~Storage/Redux/Selectors"
import { RootState } from "~Storage/Redux/Types"

export const getAllAccountTokens = (state: RootState) => state.accountTokens

export const getAllAccountFungibleTokens = createSelector(
    [getAllAccountTokens],
    accountTokens => accountTokens.fungible,
)

export const getAccountFungibleTokens = createSelector(
    [getAllAccountFungibleTokens, getSelectedAccount],
    (accountTokens, account) => {
        return accountTokens.filter(accountToken =>
            AddressUtils.compareAddresses(
                accountToken.accountAddress,
                account?.address,
            ),
        )
    },
)
