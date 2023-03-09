import React from "react"
import { StyleSheet } from "react-native"
import { SvgXml } from "react-native-svg"
import { PicassoUtils } from "~Common"
import { BaseView } from "~Components/Base"
import { Account } from "~Storage"
const { getPicassoImgSrc } = PicassoUtils

type AccountIconProps = {
    account: Account
    showDeviceIcon?: boolean
}

export const AccountIcon: React.FC<AccountIconProps> = ({ account }) => {
    // const isLedger = accountDevice?.type === DEVICE_TYPE.LEDGER

    return (
        <BaseView>
            <PicassoAddressIcon address={account.address} />
            {/* {showDeviceIcon && isLedger && (
                <span className="absolute left-[25%] bottom-[-10px] border bg-gray-lighter rounded-full py-1 px-1 ">
                    <UsbOutlined className="text-primary" role="ledgerIcon" />
                </span>
            )} */}
        </BaseView>
    )
}

type PicassoAddressIconProps = {
    address: string
    size?: number
}
const PicassoAddressIcon: React.FC<PicassoAddressIconProps> = ({
    address,
    size = 50,
}) => {
    const uri = getPicassoImgSrc(address).toString()

    return (
        <BaseView borderRadius={8} style={picassoIconStyles.view}>
            <SvgXml xml={uri} width={size} height={size} />
        </BaseView>
    )
}

const picassoIconStyles = StyleSheet.create({
    view: { overflow: "hidden" },
})
