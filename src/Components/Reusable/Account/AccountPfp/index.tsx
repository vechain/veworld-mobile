import * as FileSystem from "expo-file-system"
import React from "react"
import { useVetDomainsAvatar } from "~Hooks/useVetDomainsAvatar"
import { Device, DEVICE_TYPE, WalletAccount } from "~Model"
import { LocalFileAccountPfp } from "./LocalFileAccountPfp"
import { PicassoAccountPfp } from "./PicassoAccountPfp"
import { VetDomainsAccountPfp } from "./VetDomainsAccountPfp"

type Props = {
    account: {
        type?: DEVICE_TYPE
        device?: Device
        address: string
        profileImage?: WalletAccount["profileImage"]
    }
    size?: number
    borderRadius?: number
}

export const AccountPfp = ({ size = 50, borderRadius = 99, account, ...props }: Props) => {
    const { data: vetDomainsPfp } = useVetDomainsAvatar({ address: account.address })

    if (account.profileImage)
        return (
            <LocalFileAccountPfp
                uri={`${FileSystem.documentDirectory}${account.profileImage.uri}`}
                size={size}
                borderRadius={borderRadius}
                {...props}
            />
        )

    if (vetDomainsPfp)
        return <VetDomainsAccountPfp uri={vetDomainsPfp} size={size} borderRadius={borderRadius} {...props} />

    return <PicassoAccountPfp address={account.address} size={size} borderRadius={borderRadius} {...props} />
}
