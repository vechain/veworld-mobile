import React, { useEffect, useState } from "react"
import { BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useCloudKit } from "~Hooks"

type ClpudKitWallet = {
    data: string
    rootAddress: string
    walletType: string
}

export const ImportFromCloudScreen = () => {
    const { getAllWalletsFromCloudKit } = useCloudKit()

    const [CcoudKitWallets, setCloudKitWallets] = useState<ClpudKitWallet[] | null>(null)

    useEffect(() => {
        const init = async () => {
            const wallets = await getAllWalletsFromCloudKit()
            setCloudKitWallets(wallets)
        }

        init()
    }, [getAllWalletsFromCloudKit])

    // TODO-vas: fix translation
    return (
        <Layout
            fixedHeader={
                <BaseView>
                    <BaseText> HEADER</BaseText>
                </BaseView>
            }
            body={
                <BaseView>
                    {CcoudKitWallets &&
                        CcoudKitWallets.map((wallet, index) => {
                            return (
                                <BaseView key={index}>
                                    <BaseText>
                                        {"DATA:"} {wallet.data.slice(0, 4)}...
                                    </BaseText>
                                    <BaseSpacer height={8} />
                                    <BaseText>
                                        {"ADDRESS:"} {wallet.rootAddress}
                                    </BaseText>
                                    <BaseSpacer height={8} />
                                    <BaseText>
                                        {"TYPE:"} {wallet.walletType}
                                    </BaseText>
                                    <BaseSpacer height={22} />
                                </BaseView>
                            )
                        })}
                </BaseView>
            }
            footer={
                <BaseView>
                    <BaseText> FOOTER</BaseText>
                </BaseView>
            }
        />
    )
}
