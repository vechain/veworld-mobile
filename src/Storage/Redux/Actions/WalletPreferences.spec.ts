import {
    ABIContract,
    Address,
    Clause,
    HexUInt,
    Transaction,
    TransactionClause,
    Units,
    VET,
    VIP180_ABI,
} from "@vechain/sdk-core"
import { ethers } from "ethers"
import { B3TR, defaultMainNetwork } from "~Constants/Constants"
import { DEVICE_TYPE } from "~Model/Wallet"
import { NETWORK_TYPE } from "~Model/Network"
import { type RootState } from "../Types"
import { getStore } from "~Test"

import { setLastSentTokenAction } from "./WalletPreferences"

const constructTx = (...clauses: TransactionClause[]) =>
    Transaction.of({
        blockRef: "0x83e1ae4d51082ec7",
        expiration: 1000,
        chainTag: 39,
        clauses,
        dependsOn: null,
        gas: 1000000,
        nonce: HexUInt.random(4).toString(),
        gasPriceCoef: 255,
    })

const constructVETTransfer = (address = ethers.Wallet.createRandom().address, amount = VET.of(1, Units.wei)) =>
    Clause.transferVET(Address.of(address), amount)

const constructTokenTransfer = (address = ethers.Wallet.createRandom().address, amount = VET.of(1, Units.wei)) =>
    Clause.callFunction(Address.of(B3TR.address), ABIContract.ofAbi(VIP180_ABI).getFunction("transfer"), [
        address,
        amount.wei.toString(),
    ])

const constructTokenApprove = (address = ethers.Wallet.createRandom().address, amount = VET.of(1, Units.wei)) =>
    Clause.callFunction(Address.of(B3TR.address), ABIContract.ofAbi(VIP180_ABI).getFunction("approve"), [
        address,
        amount.wei.toString(),
    ])

const observedWallet = ethers.Wallet.createRandom().address

const buildState = (state: (oldState: Partial<RootState>) => Partial<RootState> = old => old) => {
    return state({
        ...getStore({}),
        accounts: {
            accounts: [
                {
                    address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    alias: "Account 1",
                    index: 0,
                    rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                    visible: true,
                },
                {
                    address: observedWallet,
                    alias: "Account 1",
                    index: 0,
                    rootAddress: observedWallet,
                    type: DEVICE_TYPE.LOCAL_WATCHED,
                    visible: false,
                } as any,
            ],
            selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        },
        devices: [
            {
                alias: "Wallet 1",
                index: 0,
                rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                xPub: {
                    chainCode: "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
                    publicKey:
                        // eslint-disable-next-line max-len
                        "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
                },
                wallet: JSON.stringify({
                    mnemonic: "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" "),
                    rootAddress: "0x0c1a60341e1064bebb94e8769bd508b11ca2a27d",
                    nonce: "nonce",
                }),
                position: 0,
            },
        ],
        balances: {
            mainnet: {},
            testnet: {},
            other: {},
            solo: {},
        },
        networks: {
            customNetworks: [
                {
                    currentUrl: "https://example.org",
                    defaultNet: false,
                    genesis: { ...defaultMainNetwork.genesis, id: undefined as any },
                    id: "TEST_NETWORK",
                    name: "TEST",
                    type: NETWORK_TYPE.MAIN,
                    urls: [],
                },
            ],
            hardfork: {},
            isNodeError: false,
            selectedNetwork: defaultMainNetwork.id,
            showConversionOtherNets: false,
            showTestNetTag: false,
        },
    })
}

describe("WalletPreferences - Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe("setLastSentTokenAction", () => {
        it("should early return if genesis id is not available", () => {
            const dispatch = jest.fn()

            setLastSentTokenAction(constructTx(constructVETTransfer()))(
                dispatch,
                jest.fn().mockReturnValue(
                    buildState(old => ({
                        ...old,
                        networks: { ...old.networks!, selectedNetwork: "TEST_NETWORK" },
                    })),
                ),
            )

            expect(dispatch).not.toHaveBeenCalled()
        })
        it("should early return if no selected account", () => {
            const dispatch = jest.fn()

            setLastSentTokenAction(constructTx(constructVETTransfer()))(
                dispatch,
                jest.fn().mockReturnValue(
                    buildState(old => ({
                        ...old,
                        accounts: {
                            accounts: [],
                            selectedAccount: undefined,
                        },
                    })),
                ),
            )

            expect(dispatch).not.toHaveBeenCalled()
        })
        it("should early return if account is observed", () => {
            const dispatch = jest.fn()

            setLastSentTokenAction(constructTx(constructVETTransfer()))(
                dispatch,
                jest.fn().mockReturnValue(
                    buildState(old => ({
                        ...old,
                        accounts: {
                            ...old.accounts!,
                            selectedAccount: observedWallet,
                        },
                    })),
                ),
            )

            expect(dispatch).not.toHaveBeenCalled()
        })
        it("should early return if it is not a token transfer", () => {
            const dispatch = jest.fn()

            setLastSentTokenAction(constructTx(constructTokenApprove()))(
                dispatch,
                jest.fn().mockReturnValue(buildState()),
            )

            expect(dispatch).not.toHaveBeenCalled()
        })
        it("should be able to set the last sent token action if transaction is VET", () => {
            const dispatch = jest.fn()

            setLastSentTokenAction(constructTx(constructVETTransfer()))(
                dispatch,
                jest.fn().mockReturnValue(buildState()),
            )

            expect(dispatch).toHaveBeenCalledWith({
                payload: {
                    genesisId: defaultMainNetwork.genesis.id,
                    from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    contractAddress: "0x0",
                },
                type: "walletPreferences/setLastSentToken",
            })
        })
        it("should be able to set the last sent token action if transaction is an ERC-20 transfer", () => {
            const dispatch = jest.fn()
            setLastSentTokenAction(constructTx(constructTokenTransfer()))(
                dispatch,
                jest.fn().mockReturnValue(buildState()),
            )

            expect(dispatch).toHaveBeenCalledWith({
                payload: {
                    genesisId: defaultMainNetwork.genesis.id,
                    from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    contractAddress: B3TR.address.toLowerCase(),
                },
                type: "walletPreferences/setLastSentToken",
            })
        })
    })
})
