import React from "react"
import { Account } from "~Storage"

type Props = {
    account: Account
}
export const AccountWithBalanceBox: React.FC<Props> = ({ account }) => {
    console.log(account)
    return <></>
}
