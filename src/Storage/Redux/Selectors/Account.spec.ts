import { ethers } from "ethers"
import { DerivationPath, VTHO } from "~Constants"
import { DEVICE_TYPE, LocalAccountWithDevice, NETWORK_TYPE, WalletAccount } from "~Model"
import { TestHelpers } from "~Test"
import { selectDelegationAccountsWithVtho } from "./Account"

const createAccountWithDevice = (acc: WalletAccount) =>
    ({
        ...acc,
        device: {
            wallet: acc.address,
            type: DEVICE_TYPE.LOCAL_MNEMONIC,
            alias: "LOCAL 1",
            index: 0,
            position: 0,
            rootAddress: acc.address,
            derivationPath: DerivationPath.VET,
        },
    } satisfies LocalAccountWithDevice)

describe("Account Selectors", () => {
    it("selectDelegationAccountsWithVtho", () => {
        const result = selectDelegationAccountsWithVtho.resultFunc(
            [
                createAccountWithDevice(TestHelpers.data.account1D1),
                createAccountWithDevice(TestHelpers.data.account1D2),
                createAccountWithDevice(TestHelpers.data.account2D1),
            ],
            { type: NETWORK_TYPE.TEST } as any,
            {
                [NETWORK_TYPE.TEST]: {
                    [TestHelpers.data.account1D1.address]: [
                        {
                            balance: ethers.utils.parseEther("1").toHexString(),
                            tokenAddress: VTHO.address,
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                        },
                    ],
                    [TestHelpers.data.account1D2.address]: [
                        {
                            balance: ethers.utils.parseEther("3").toHexString(),
                            tokenAddress: VTHO.address,
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                        },
                    ],
                    [TestHelpers.data.account2D1.address]: [
                        {
                            balance: ethers.utils.parseEther("2").toHexString(),
                            tokenAddress: VTHO.address,
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                        },
                    ],
                },
            } as any,
        )

        expect(result[0].address).toBe(TestHelpers.data.account1D2.address)
        expect(result[1].address).toBe(TestHelpers.data.account2D1.address)
        expect(result[2].address).toBe(TestHelpers.data.account1D1.address)
    })
})
