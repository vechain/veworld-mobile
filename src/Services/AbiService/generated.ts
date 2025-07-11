/* eslint-disable max-len */
export default {
    "NewProposal(indexed uint256,indexed uint8,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "ptype",
                type: "uint8",
            },
            {
                indexed: true,
                name: "creator",
                type: "address",
            },
        ],
        name: "NewProposal",
        type: "event",
    },
    "ProposalCanceled(indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
        ],
        name: "ProposalCanceled",
        type: "event",
    },
    "NewVote(indexed uint256,address,indexed address,indexed uint256,uint32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: false,
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                name: "endorser",
                type: "address",
            },
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                name: "options",
                type: "uint32",
            },
        ],
        name: "NewVote",
        type: "event",
    },
    "ProposerList(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_proposer",
                type: "address",
            },
        ],
        name: "ProposerList",
        type: "event",
    },
    "RemoveFromProposerList(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_proposer",
                type: "address",
            },
        ],
        name: "RemoveFromProposerList",
        type: "event",
    },
    "BlackList(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_badGuy",
                type: "address",
            },
        ],
        name: "BlackList",
        type: "event",
    },
    "RemoveFromBlackList(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_innocent",
                type: "address",
            },
        ],
        name: "RemoveFromBlackList",
        type: "event",
    },
    Paused: {
        anonymous: false,
        inputs: [],
        name: "Paused",
        type: "event",
    },
    Unpaused: {
        anonymous: false,
        inputs: [],
        name: "Unpaused",
        type: "event",
    },
    "OwnershipTransferred(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    "ArbitrationCreated(indexed address,address,indexed address,indexed address,uint256[],uint256[],bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_creator",
                type: "address",
            },
            {
                indexed: false,
                name: "_arbitration",
                type: "address",
            },
            {
                indexed: true,
                name: "_party1",
                type: "address",
            },
            {
                indexed: true,
                name: "_party2",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersal",
                type: "uint256[]",
            },
            {
                indexed: false,
                name: "_funding",
                type: "uint256[]",
            },
            {
                indexed: false,
                name: "_agreementHash",
                type: "bytes32",
            },
        ],
        name: "ArbitrationCreated",
        type: "event",
    },
    "OwnershipRenounced(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "previousOwner",
                type: "address",
            },
        ],
        name: "OwnershipRenounced",
        type: "event",
    },
    "StateChange(uint8,uint8,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "_oldState",
                type: "uint8",
            },
            {
                indexed: false,
                name: "_newState",
                type: "uint8",
            },
            {
                indexed: false,
                name: "_timestamp",
                type: "uint256",
            },
        ],
        name: "StateChange",
        type: "event",
    },
    "ContractCreated(indexed address,indexed address,uint256[],uint256[],bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party1",
                type: "address",
            },
            {
                indexed: true,
                name: "_party2",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersal",
                type: "uint256[]",
            },
            {
                indexed: false,
                name: "_funding",
                type: "uint256[]",
            },
            {
                indexed: false,
                name: "_agreementHash",
                type: "bytes32",
            },
        ],
        name: "ContractCreated",
        type: "event",
    },
    "ContractSigned(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_funding",
                type: "uint256",
            },
        ],
        name: "ContractSigned",
        type: "event",
    },
    "ContractUnsigned(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_funding",
                type: "uint256",
            },
        ],
        name: "ContractUnsigned",
        type: "event",
    },
    "ContractAgreed(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
        ],
        name: "ContractAgreed",
        type: "event",
    },
    "ContractUnagreed(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
        ],
        name: "ContractUnagreed",
        type: "event",
    },
    "ContractAmendmentProposed(indexed address,uint256[],uint256[],bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersal",
                type: "uint256[]",
            },
            {
                indexed: false,
                name: "_funding",
                type: "uint256[]",
            },
            {
                indexed: false,
                name: "_agreementHash",
                type: "bytes32",
            },
        ],
        name: "ContractAmendmentProposed",
        type: "event",
    },
    "ContractAmendmentAgreed(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
        ],
        name: "ContractAmendmentAgreed",
        type: "event",
    },
    "ContractAmendmentUnagreed(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
        ],
        name: "ContractAmendmentUnagreed",
        type: "event",
    },
    "ContractWithdrawn(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersal",
                type: "uint256",
            },
        ],
        name: "ContractWithdrawn",
        type: "event",
    },
    "ContractDisputed(indexed address,uint256[])": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersal",
                type: "uint256[]",
            },
        ],
        name: "ContractDisputed",
        type: "event",
    },
    "ContractDisputeDispersalAmended(indexed address,uint256[])": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersal",
                type: "uint256[]",
            },
        ],
        name: "ContractDisputeDispersalAmended",
        type: "event",
    },
    "DisputeEndsAdjusted(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "_oldDisputeEnds",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_newDisputeEnds",
                type: "uint256",
            },
        ],
        name: "DisputeEndsAdjusted",
        type: "event",
    },
    "VoteCast(indexed address,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_voter",
                type: "address",
            },
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "VoteCast",
        type: "event",
    },
    "VoterPayout(indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_voter",
                type: "address",
            },
            {
                indexed: false,
                name: "_stakedAmount",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_rewardAmount",
                type: "uint256",
            },
        ],
        name: "VoterPayout",
        type: "event",
    },
    "PartyPayout(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_party",
                type: "address",
            },
            {
                indexed: false,
                name: "_dispersalAmount",
                type: "uint256",
            },
        ],
        name: "PartyPayout",
        type: "event",
    },
    "Candidate(indexed address,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "nodeMaster",
                type: "address",
            },
            {
                indexed: false,
                name: "action",
                type: "bytes32",
            },
        ],
        name: "Candidate",
        type: "event",
    },
    "_join(indexed uint256,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "player",
                type: "address",
            },
            {
                indexed: false,
                name: "combatant",
                type: "uint256",
            },
            {
                indexed: false,
                name: "stakes",
                type: "uint256",
            },
        ],
        name: "_join",
        type: "event",
        signature: "0xadd33c52831a0b1c1f1f17c56aa20b5c040473e944e6f3475d38556c779df755",
    },
    "_repent(indexed uint256,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "player",
                type: "address",
            },
            {
                indexed: false,
                name: "combatant",
                type: "uint256",
            },
            {
                indexed: false,
                name: "stakes",
                type: "uint256",
            },
        ],
        name: "_repent",
        type: "event",
        signature: "0x73eed075d58172e0b579e14129d5943b894bbc02470e758208ed3cf164b4e7a9",
    },
    "_withdraw(indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "player",
                type: "address",
            },
            {
                indexed: false,
                name: "award",
                type: "uint256",
            },
        ],
        name: "_withdraw",
        type: "event",
        signature: "0x491234459cc5c2ddc7327952ccf826b06930abbe200441971916f5e393da8872",
    },
    "_creat(indexed uint256,string,uint256,string,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: false,
                name: "gameName",
                type: "string",
            },
            {
                indexed: false,
                name: "startTime",
                type: "uint256",
            },
            {
                indexed: false,
                name: "leftName",
                type: "string",
            },
            {
                indexed: false,
                name: "rightName",
                type: "string",
            },
        ],
        name: "_creat",
        type: "event",
        signature: "0xb8c8322ac4e6ae368af6cfc837a0906e4ee9a35f49ef8b747adcd46dfdac5859",
    },
    "_cancel(indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "_cancel",
        type: "event",
        signature: "0x4efae47c6e6478ccc4dce1a2eefdbc93ba85a2822602ec18860a9ea5ce841c5b",
    },
    "_lock(indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "_lock",
        type: "event",
        signature: "0x8ec22837bcbc063bf52cff498b2e9675cec54e6a3b14d076c920a6c8272f99d0",
    },
    "_finish(indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: false,
                name: "winner",
                type: "uint256",
            },
        ],
        name: "_finish",
        type: "event",
        signature: "0x0927c65aa785cfbe2fdc3436508df236f9d1ba0b35b6ed3a55e73a3159dca7a8",
    },
    "FactorChanged(bytes32,uint8,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "model",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "pos",
                type: "uint8",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "FactorChanged",
        type: "event",
    },
    "DatasetRegistered(uint8,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "datasetId",
                type: "uint8",
            },
            {
                indexed: false,
                name: "addr",
                type: "address",
            },
        ],
        name: "DatasetRegistered",
        type: "event",
    },
    "PolicyAdded(indexed bytes32,uint8,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "datasetId",
                type: "uint8",
            },
            {
                indexed: false,
                name: "policy",
                type: "address",
            },
        ],
        name: "PolicyAdded",
        type: "event",
    },
    "PolicyReset(indexed bytes32,uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "datasetId",
                type: "uint8",
            },
        ],
        name: "PolicyReset",
        type: "event",
    },
    "KeyChanged(indexed uint8,indexed bytes32,indexed bytes32,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "setId",
                type: "uint8",
            },
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: true,
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "value",
                type: "bytes32",
            },
        ],
        name: "KeyChanged",
        type: "event",
    },
    "NewAccount(indexed bytes32,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: true,
                name: "account",
                type: "address",
            },
        ],
        name: "NewAccount",
        type: "event",
    },
    "DelAccount(indexed bytes32,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: true,
                name: "account",
                type: "address",
            },
        ],
        name: "DelAccount",
        type: "event",
    },
    "BytesKeyChanged(indexed uint8,indexed bytes32,indexed bytes32,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "setId",
                type: "uint8",
            },
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: true,
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "value",
                type: "bytes",
            },
        ],
        name: "BytesKeyChanged",
        type: "event",
    },
    "Bytes32KeyChanged(indexed uint8,indexed bytes32,indexed bytes32,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "setId",
                type: "uint8",
            },
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: true,
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "value",
                type: "bytes32",
            },
        ],
        name: "Bytes32KeyChanged",
        type: "event",
    },
    "UInt256KeyChanged(indexed uint8,indexed bytes32,indexed bytes32,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "setId",
                type: "uint8",
            },
            {
                indexed: true,
                name: "uid",
                type: "bytes32",
            },
            {
                indexed: true,
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "UInt256KeyChanged",
        type: "event",
    },
    "Paused(address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "account",
                type: "address",
            },
        ],
        name: "Paused",
        type: "event",
    },
    "Unpaused(address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "account",
                type: "address",
            },
        ],
        name: "Unpaused",
        type: "event",
    },
    "DatasetChanged(indexed uint8,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "datasetId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "address",
                name: "contractAddr",
                type: "address",
            },
        ],
        name: "DatasetChanged",
        type: "event",
    },
    "PolicyAdded(indexed uint8,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "datasetId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "address",
                name: "policy",
                type: "address",
            },
        ],
        name: "PolicyAdded",
        type: "event",
    },
    "PolicyReset(indexed uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "datasetId",
                type: "uint8",
            },
        ],
        name: "PolicyReset",
        type: "event",
    },
    "SetBytesWithSig(indexed uint8,bytes32,bytes,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "datasetId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "value",
                type: "bytes",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "authsig",
                type: "bytes",
            },
        ],
        name: "SetBytesWithSig",
        type: "event",
    },
    "DefaultPlatformFeeChanged(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldDefaultPlatformFee",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newDefaultPlatformFee",
                type: "uint256",
            },
        ],
        name: "DefaultPlatformFeeChanged",
        type: "event",
    },
    "DefaultRecovererChanged(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldDefaultRecoverer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newDefaultRecoverer",
                type: "address",
            },
        ],
        name: "DefaultRecovererChanged",
        type: "event",
    },
    "DefaultSwapFeeChanged(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldDefaultSwapFee",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newDefaultSwapFee",
                type: "uint256",
            },
        ],
        name: "DefaultSwapFeeChanged",
        type: "event",
    },
    "PairCreated(indexed address,indexed address,address,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "token0",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "token1",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "pair",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalPair",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "swapFee",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "platformFee",
                type: "uint256",
            },
        ],
        name: "PairCreated",
        type: "event",
    },
    "PlatformFeeToChanged(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldFeeTo",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newFeeTo",
                type: "address",
            },
        ],
        name: "PlatformFeeToChanged",
        type: "event",
    },
    "Approval(indexed address,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    "Burn(indexed address,uint256,uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
        ],
        name: "Burn",
        type: "event",
    },
    "Mint(indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1",
                type: "uint256",
            },
        ],
        name: "Mint",
        type: "event",
    },
    "PlatformFeeChanged(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldPlatformFee",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newPlatformFee",
                type: "uint256",
            },
        ],
        name: "PlatformFeeChanged",
        type: "event",
    },
    "Swap(indexed address,uint256,uint256,uint256,uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0In",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1In",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0Out",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1Out",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
        ],
        name: "Swap",
        type: "event",
    },
    "SwapFeeChanged(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldSwapFee",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newSwapFee",
                type: "uint256",
            },
        ],
        name: "SwapFeeChanged",
        type: "event",
    },
    "Sync(uint112,uint112)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint112",
                name: "reserve0",
                type: "uint112",
            },
            {
                indexed: false,
                internalType: "uint112",
                name: "reserve1",
                type: "uint112",
            },
        ],
        name: "Sync",
        type: "event",
    },
    "Transfer(indexed address,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    "Conversion(indexed int8,indexed address,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "tradeType",
                type: "int8",
            },
            {
                indexed: true,
                name: "_trader",
                type: "address",
            },
            {
                indexed: false,
                name: "_sellAmount",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_return",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_conversionFee",
                type: "uint256",
            },
        ],
        name: "Conversion",
        type: "event",
    },
    "ConversionFeeUpdate(uint32,uint32)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "_prevFee",
                type: "uint32",
            },
            {
                indexed: false,
                name: "_newFee",
                type: "uint32",
            },
        ],
        name: "ConversionFeeUpdate",
        type: "event",
    },
    "OwnerUpdate(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_prevOwner",
                type: "address",
            },
            {
                indexed: true,
                name: "_newOwner",
                type: "address",
            },
        ],
        name: "OwnerUpdate",
        type: "event",
    },
    "AccountDeployed(indexed bytes32,indexed address,address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "userOpHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "factory",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "paymaster",
                type: "address",
            },
        ],
        name: "AccountDeployed",
        type: "event",
    },
    BeforeExecution: {
        anonymous: false,
        inputs: [],
        name: "BeforeExecution",
        type: "event",
    },
    "Deposited(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalDeposit",
                type: "uint256",
            },
        ],
        name: "Deposited",
        type: "event",
    },
    "SignatureAggregatorChanged(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "aggregator",
                type: "address",
            },
        ],
        name: "SignatureAggregatorChanged",
        type: "event",
    },
    "StakeLocked(indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalStaked",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "unstakeDelaySec",
                type: "uint256",
            },
        ],
        name: "StakeLocked",
        type: "event",
    },
    "StakeUnlocked(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "withdrawTime",
                type: "uint256",
            },
        ],
        name: "StakeUnlocked",
        type: "event",
    },
    "StakeWithdrawn(indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "withdrawAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "StakeWithdrawn",
        type: "event",
    },
    "UserOperationEvent(indexed bytes32,indexed address,indexed address,uint256,bool,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "userOpHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "paymaster",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "success",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "actualGasCost",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "actualGasUsed",
                type: "uint256",
            },
        ],
        name: "UserOperationEvent",
        type: "event",
    },
    "UserOperationRevertReason(indexed bytes32,indexed address,uint256,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "userOpHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "revertReason",
                type: "bytes",
            },
        ],
        name: "UserOperationRevertReason",
        type: "event",
    },
    "Withdrawn(indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "withdrawAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "Withdrawn",
        type: "event",
    },
    "Approval(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "approved",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    "ApprovalForAll(indexed address,indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "ApprovalForAll",
        type: "event",
    },
    "Transfer(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    "TokenPurchase(indexed address,indexed uint256,indexed uint256)": {
        name: "TokenPurchase",
        inputs: [
            {
                type: "address",
                name: "buyer",
                indexed: true,
            },
            {
                type: "uint256",
                name: "ethsold",
                indexed: true,
            },
            {
                type: "uint256",
                name: "tokensbought",
                indexed: true,
            },
        ],
        anonymous: false,
        type: "event",
    },
    "EthPurchase(indexed address,indexed uint256,indexed uint256)": {
        name: "EthPurchase",
        inputs: [
            {
                type: "address",
                name: "buyer",
                indexed: true,
            },
            {
                type: "uint256",
                name: "tokenssold",
                indexed: true,
            },
            {
                type: "uint256",
                name: "ethbought",
                indexed: true,
            },
        ],
        anonymous: false,
        type: "event",
    },
    "AddLiquidity(indexed address,indexed uint256,indexed uint256)": {
        name: "AddLiquidity",
        inputs: [
            {
                type: "address",
                name: "provider",
                indexed: true,
            },
            {
                type: "uint256",
                name: "ethamount",
                indexed: true,
            },
            {
                type: "uint256",
                name: "tokenamount",
                indexed: true,
            },
        ],
        anonymous: false,
        type: "event",
    },
    "RemoveLiquidity(indexed address,indexed uint256,indexed uint256)": {
        name: "RemoveLiquidity",
        inputs: [
            {
                type: "address",
                name: "provider",
                indexed: true,
            },
            {
                type: "uint256",
                name: "ethamount",
                indexed: true,
            },
            {
                type: "uint256",
                name: "tokenamount",
                indexed: true,
            },
        ],
        anonymous: false,
        type: "event",
    },
    "Proposal(indexed bytes32,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalID",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "action",
                type: "bytes32",
            },
        ],
        name: "Proposal",
        type: "event",
    },
    "Approver(indexed address,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "approver",
                type: "address",
            },
            {
                indexed: false,
                name: "action",
                type: "bytes32",
            },
        ],
        name: "Approver",
        type: "event",
    },
    "VotingContract(indexed address,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "contractAddr",
                type: "address",
            },
            {
                indexed: false,
                name: "action",
                type: "bytes32",
            },
        ],
        name: "VotingContract",
        type: "event",
    },
    "AuctionBuffersUpdated(uint64,uint96)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint64",
                name: "timeBuffer",
                type: "uint64",
            },
            {
                indexed: false,
                internalType: "uint96",
                name: "bidBufferBps",
                type: "uint96",
            },
        ],
        name: "AuctionBuffersUpdated",
        type: "event",
    },
    "AuctionClosed(uint256,indexed uint256,indexed address,address,indexed bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "itemId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "auctionCreator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "winningBidder",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bool",
                name: "cancelled",
                type: "bool",
            },
        ],
        name: "AuctionClosed",
        type: "event",
    },
    "CreateMarketItem(indexed uint256,indexed uint256,indexed address,tuple)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "itemId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "lister",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "tokenOwner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "itemId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "tokenId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "startTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "endTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "reserveTokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "buyoutTokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "enum IMarketplace.ListingType",
                        name: "listingType",
                        type: "uint8",
                    },
                ],
                indexed: false,
                internalType: "struct IMarketplace.MarketItem",
                name: "newItem",
                type: "tuple",
            },
        ],
        name: "CreateMarketItem",
        type: "event",
    },
    "ListingRestricted(bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bool",
                name: "restricted",
                type: "bool",
            },
        ],
        name: "ListingRestricted",
        type: "event",
    },
    "MarketFeeUpdate(uint96)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint96",
                name: "newFee",
                type: "uint96",
            },
        ],
        name: "MarketFeeUpdate",
        type: "event",
    },
    "NewOffer(indexed address,uint256,indexed uint256,uint256,indexed uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "offeror",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "itemId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "offerPrice",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "enum IMarketplace.ListingType",
                name: "listingType",
                type: "uint8",
            },
        ],
        name: "NewOffer",
        type: "event",
    },
    "NewSale(indexed address,address,indexed uint256,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "itemId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "buyoutPrice",
                type: "uint256",
            },
        ],
        name: "NewSale",
        type: "event",
    },
    "RemoveMarketItem(indexed uint256,indexed uint256,indexed address,tuple)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "itemId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "lister",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "tokenOwner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "itemId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "tokenId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "startTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "endTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "reserveTokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "buyoutTokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "enum IMarketplace.ListingType",
                        name: "listingType",
                        type: "uint8",
                    },
                ],
                indexed: false,
                internalType: "struct IMarketplace.MarketItem",
                name: "removeItem",
                type: "tuple",
            },
        ],
        name: "RemoveMarketItem",
        type: "event",
    },
    "UpdateMarketItem(indexed uint256,indexed uint256,indexed address,tuple)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "itemId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "lister",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "tokenOwner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "itemId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "tokenId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "startTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "endTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "reserveTokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "buyoutTokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "enum IMarketplace.ListingType",
                        name: "listingType",
                        type: "uint8",
                    },
                ],
                indexed: false,
                internalType: "struct IMarketplace.MarketItem",
                name: "updatedItem",
                type: "tuple",
            },
        ],
        name: "UpdateMarketItem",
        type: "event",
    },
    "AddPendingMint(indexed address,indexed uint8,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "minter",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint8",
                name: "amount",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pendingId",
                type: "uint256",
            },
        ],
        name: "AddPendingMint",
        type: "event",
    },
    "MintedWithRandomNumber(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "minter",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "randomSeed",
                type: "uint256",
            },
        ],
        name: "MintedWithRandomNumber",
        type: "event",
    },
    "NewExchange(indexed address,indexed address)": {
        name: "NewExchange",
        inputs: [
            {
                type: "address",
                name: "token",
                indexed: true,
            },
            {
                type: "address",
                name: "exchange",
                indexed: true,
            },
        ],
        anonymous: false,
        type: "event",
    },
    "InboundChanged(indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addr",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "enable",
                type: "bool",
            },
        ],
        name: "InboundChanged",
        type: "event",
    },
    "KeyChanged(indexed bytes32,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "value",
                type: "bytes",
            },
        ],
        name: "KeyChanged",
        type: "event",
    },
    ClaimsReset: {
        anonymous: false,
        inputs: [],
        name: "ClaimsReset",
        type: "event",
    },
    "FreezeStatus(indexed address,uint256,address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "wallet",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "walletTimeRemaining",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "nftTimeRemaining",
                type: "uint256",
            },
        ],
        name: "FreezeStatus",
        type: "event",
    },
    "NFTFrozen(indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenContractAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "freezeDuration",
                type: "uint256",
            },
        ],
        name: "NFTFrozen",
        type: "event",
    },
    "NFTUnfrozen(indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenContractAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "NFTUnfrozen",
        type: "event",
    },
    "TokenClaimed(indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenContractAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "TokenClaimed",
        type: "event",
    },
    "WalletFrozen(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "wallet",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "freezeDuration",
                type: "uint256",
            },
        ],
        name: "WalletFrozen",
        type: "event",
    },
    "WalletUnfrozen(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "wallet",
                type: "address",
            },
        ],
        name: "WalletUnfrozen",
        type: "event",
    },
    "EnvelopeCreated(indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "from",
                type: "address",
            },
        ],
        name: "EnvelopeCreated",
        type: "event",
    },
    "EnvelopeClaimed(indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "EnvelopeClaimed",
        type: "event",
    },
    "EnvelopeRefunded(indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "EnvelopeRefunded",
        type: "event",
    },
    "AdminChanged(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "previousAdmin",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
        ],
        name: "AdminChanged",
        type: "event",
    },
    "AuctionExecuted(indexed uint256,indexed address,indexed uint256,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "AuctionExecuted",
        type: "event",
    },
    "CancelAuctionEvent(indexed uint256,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "CancelAuctionEvent",
        type: "event",
    },
    "ModifiedEnterpriseFee(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "feeEnterpriseReceiver",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "percentage",
                type: "uint256",
            },
        ],
        name: "ModifiedEnterpriseFee",
        type: "event",
    },
    "ModifiedFoundationFee(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "feeFoundationReceiver",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "percentage",
                type: "uint256",
            },
        ],
        name: "ModifiedFoundationFee",
        type: "event",
    },
    "ModifiedVIP180(indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addressVIP181",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "allowed",
                type: "bool",
            },
        ],
        name: "ModifiedVIP180",
        type: "event",
    },
    "ModifiedVIP181(indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addressVIP181",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "allowed",
                type: "bool",
            },
        ],
        name: "ModifiedVIP181",
        type: "event",
    },
    "NewAuction(indexed uint256,indexed address,indexed uint256,address,uint256,uint256,uint256,bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startingTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isVIP180",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "NewAuction",
        type: "event",
    },
    "NewBid(indexed uint256,indexed address,indexed uint256,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "maxBidUser",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "maxBid",
                type: "uint256",
            },
        ],
        name: "NewBid",
        type: "event",
    },
    "RoleAdminChanged(indexed bytes32,indexed bytes32,indexed bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32",
            },
        ],
        name: "RoleAdminChanged",
        type: "event",
    },
    "RoleRevoked(indexed bytes32,indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleRevoked",
        type: "event",
    },
    "RotationFinalized(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAdmin",
                type: "address",
            },
        ],
        name: "RotationFinalized",
        type: "event",
    },
    "TimeUpdate(indexed uint256,indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newEndTime",
                type: "uint256",
            },
        ],
        name: "TimeUpdate",
        type: "event",
    },
    "TradeRestrictionModified(indexed address,indexed bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bool",
                name: "tradeRestricted",
                type: "bool",
            },
        ],
        name: "TradeRestrictionModified",
        type: "event",
    },
    "CloseBuyOffer(indexed uint256,indexed address,indexed uint256,uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "enum OfferContractVIP180_v2.OfferType",
                name: "offerType",
                type: "uint8",
            },
        ],
        name: "CloseBuyOffer",
        type: "event",
    },
    "NewBuyOfferToCollection(indexed uint256,indexed address,uint256,uint256,uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "NewBuyOfferToCollection",
        type: "event",
    },
    "NewBuyOfferToToken(indexed uint256,indexed address,indexed uint256,uint256,uint256,uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "NewBuyOfferToToken",
        type: "event",
    },
    "OfferAccepted(indexed uint256,indexed address,indexed uint256,uint8,address,uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "enum OfferContractVIP180_v2.OfferType",
                name: "offerType",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "vip180",
                type: "address",
            },
        ],
        name: "OfferAccepted",
        type: "event",
    },
    "CancelNonCustodial(indexed uint256,indexed address,indexed uint256,address,uint256,bytes32,uint256,bool,address)":
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "saleId",
                    type: "uint256",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nft",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bytes32",
                    name: "code",
                    type: "bytes32",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "startingTime",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bool",
                    name: "isVIP180",
                    type: "bool",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "addressVIP180",
                    type: "address",
                },
            ],
            name: "CancelNonCustodial",
            type: "event",
        },
    "ListingNonCustodial(indexed uint256,indexed address,indexed uint256,address,uint256,bytes32,uint256,bool,address)":
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "saleId",
                    type: "uint256",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nft",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bytes32",
                    name: "code",
                    type: "bytes32",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "startingTime",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bool",
                    name: "isVIP180",
                    type: "bool",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "addressVIP180",
                    type: "address",
                },
            ],
            name: "ListingNonCustodial",
            type: "event",
        },
    "PurchaseNonCustodial(indexed uint256,indexed address,indexed uint256,address,uint256,bytes32,uint256,bool,address)":
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "saleId",
                    type: "uint256",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nft",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "buyer",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bytes32",
                    name: "code",
                    type: "bytes32",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "startingTime",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bool",
                    name: "isVIP180",
                    type: "bool",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "addressVIP180",
                    type: "address",
                },
            ],
            name: "PurchaseNonCustodial",
            type: "event",
        },
    "AddOwner(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "AddOwner",
        type: "event",
    },
    "ConfirmTransaction(indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "txIndex",
                type: "uint256",
            },
        ],
        name: "ConfirmTransaction",
        type: "event",
    },
    "Deposit(indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "balance",
                type: "uint256",
            },
        ],
        name: "Deposit",
        type: "event",
    },
    "ExecuteTransaction(indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "txIndex",
                type: "uint256",
            },
        ],
        name: "ExecuteTransaction",
        type: "event",
    },
    "RemoveOwner(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "RemoveOwner",
        type: "event",
    },
    "RevokeConfirmation(indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "txIndex",
                type: "uint256",
            },
        ],
        name: "RevokeConfirmation",
        type: "event",
    },
    "SubmitTransaction(indexed address,indexed uint256,indexed address,uint256,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "txIndex",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "SubmitTransaction",
        type: "event",
    },
    "Initialized(uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint64",
                name: "version",
                type: "uint64",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    "NFTBlacklisted(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
        ],
        name: "NFTBlacklisted",
        type: "event",
    },
    "NFTReported(indexed address,uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "signalCount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "reporter",
                type: "address",
            },
        ],
        name: "NFTReported",
        type: "event",
    },
    "NFTWhitelisted(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
        ],
        name: "NFTWhitelisted",
        type: "event",
    },
    "RoleGranted(indexed bytes32,indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleGranted",
        type: "event",
    },
    "Upgraded(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "implementation",
                type: "address",
            },
        ],
        name: "Upgraded",
        type: "event",
    },
    "ValueUpdate(bytes32,uint128,uint128)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "value",
                type: "uint128",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "updatedAt",
                type: "uint128",
            },
        ],
        name: "ValueUpdate",
        type: "event",
    },
    "Set(indexed bytes32,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "key",
                type: "bytes32",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "Set",
        type: "event",
    },
    "AccountInitialized(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IEntryPoint",
                name: "entryPoint",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "AccountInitialized",
        type: "event",
    },
    "BeaconUpgraded(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "beacon",
                type: "address",
            },
        ],
        name: "BeaconUpgraded",
        type: "event",
    },
    "Initialized(uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint8",
                name: "version",
                type: "uint8",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    "PublicKeyAdded(indexed bytes32,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "keyHash",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pubKeyX",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pubKeyY",
                type: "uint256",
            },
        ],
        name: "PublicKeyAdded",
        type: "event",
    },
    "PublicKeyRemoved(indexed bytes32,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "keyHash",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pubKeyX",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pubKeyY",
                type: "uint256",
            },
        ],
        name: "PublicKeyRemoved",
        type: "event",
    },
    "$Master(address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "newMaster",
                type: "address",
            },
        ],
        name: "$Master",
        type: "event",
    },
    "$CreditPlan(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "credit",
                type: "uint256",
            },
            {
                indexed: false,
                name: "recoveryRate",
                type: "uint256",
            },
        ],
        name: "$CreditPlan",
        type: "event",
    },
    "$User(indexed address,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                name: "action",
                type: "bytes32",
            },
        ],
        name: "$User",
        type: "event",
    },
    "$Sponsor(indexed address,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "sponsor",
                type: "address",
            },
            {
                indexed: false,
                name: "action",
                type: "bytes32",
            },
        ],
        name: "$Sponsor",
        type: "event",
    },
    "DelegationExitRequested(indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "delegationEndBlock",
                type: "uint256",
            },
        ],
        name: "DelegationExitRequested",
        type: "event",
    },
    "DelegationRewardsClaimed(indexed uint256,uint256,indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewards",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "claimer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "DelegationRewardsClaimed",
        type: "event",
    },
    "DelegationSimulationStarted(indexed uint256,indexed address,uint256,indexed bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "delegator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardsAccumulationStartBlock",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bool",
                name: "isDelegationForever",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "caller",
                type: "address",
            },
        ],
        name: "DelegationSimulationStarted",
        type: "event",
    },
    "RewardsAccumulationEndBlockSet(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardsAccumulationEndBlock",
                type: "uint256",
            },
        ],
        name: "RewardsAccumulationEndBlockSet",
        type: "event",
    },
    "BaseURIUpdated(string,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "oldBaseURI",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "newBaseURI",
                type: "string",
            },
        ],
        name: "BaseURIUpdated",
        type: "event",
    },
    "BaseVTHORewardsClaimed(indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "BaseVTHORewardsClaimed",
        type: "event",
    },
    "ContractAddressUpdated(address,address,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "contractName",
                type: "string",
            },
        ],
        name: "ContractAddressUpdated",
        type: "event",
    },
    "LevelCapUpdated(indexed uint8,uint32,uint32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "levelId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "oldCap",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "newCap",
                type: "uint32",
            },
        ],
        name: "LevelCapUpdated",
        type: "event",
    },
    "LevelCirculatingSupplyUpdated(indexed uint8,uint208,uint208)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "levelId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint208",
                name: "oldCirculatingSupply",
                type: "uint208",
            },
            {
                indexed: false,
                internalType: "uint208",
                name: "newCirculatingSupply",
                type: "uint208",
            },
        ],
        name: "LevelCirculatingSupplyUpdated",
        type: "event",
    },
    "LevelUpdated(indexed uint8,string,bool,uint64,uint64,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint8",
                name: "levelId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isX",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "uint64",
                name: "maturityBlocks",
                type: "uint64",
            },
            {
                indexed: false,
                internalType: "uint64",
                name: "scaledRewardFactor",
                type: "uint64",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "vetAmountRequiredToStake",
                type: "uint256",
            },
        ],
        name: "LevelUpdated",
        type: "event",
    },
    "TokenBurned(indexed address,indexed uint8,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint8",
                name: "levelId",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "vetAmountStaked",
                type: "uint256",
            },
        ],
        name: "TokenBurned",
        type: "event",
    },
    "TokenMinted(indexed address,indexed uint8,indexed bool,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint8",
                name: "levelId",
                type: "uint8",
            },
            {
                indexed: true,
                internalType: "bool",
                name: "migrated",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "vetAmountStaked",
                type: "uint256",
            },
        ],
        name: "TokenMinted",
        type: "event",
    },
    "VthoGenerationEndTimestampSet(uint48,uint48)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint48",
                name: "oldVthoGenerationEndTimestamp",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "newVthoGenerationEndTimestamp",
                type: "uint48",
            },
        ],
        name: "VthoGenerationEndTimestampSet",
        type: "event",
    },
    "FeePoolAddressUpdated(address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "newFeePoolAddr",
                type: "address",
            },
        ],
        name: "FeePoolAddressUpdated",
        type: "event",
    },
    "FeePercentUpdated(uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "newPercent",
                type: "uint8",
            },
        ],
        name: "FeePercentUpdated",
        type: "event",
    },
    Pause: {
        anonymous: false,
        inputs: [],
        name: "Pause",
        type: "event",
    },
    Unpause: {
        anonymous: false,
        inputs: [],
        name: "Unpause",
        type: "event",
    },
    "AuctionCreated(indexed uint256,indexed uint256,uint256,uint256,uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                name: "startingPrice",
                type: "uint256",
            },
            {
                indexed: false,
                name: "endingPrice",
                type: "uint256",
            },
            {
                indexed: false,
                name: "duration",
                type: "uint64",
            },
        ],
        name: "AuctionCreated",
        type: "event",
    },
    "AuctionSuccessful(indexed uint256,indexed uint256,indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                name: "winner",
                type: "address",
            },
            {
                indexed: false,
                name: "finalPrice",
                type: "uint256",
            },
        ],
        name: "AuctionSuccessful",
        type: "event",
    },
    "AddAuctionWhiteList(indexed uint256,indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "candidate",
                type: "address",
            },
        ],
        name: "AddAuctionWhiteList",
        type: "event",
    },
    "RemoveAuctionWhiteList(indexed uint256,indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "candidate",
                type: "address",
            },
        ],
        name: "RemoveAuctionWhiteList",
        type: "event",
    },
    "NewUpgradeApply(indexed uint256,indexed address,uint8,uint64,uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "applier",
                type: "address",
            },
            {
                indexed: false,
                name: "level",
                type: "uint8",
            },
            {
                indexed: false,
                name: "applyTime",
                type: "uint64",
            },
            {
                indexed: false,
                name: "applyBlockno",
                type: "uint64",
            },
        ],
        name: "NewUpgradeApply",
        type: "event",
    },
    "CancelUpgrade(indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "owner",
                type: "address",
            },
        ],
        name: "CancelUpgrade",
        type: "event",
    },
    "LevelChanged(indexed uint256,indexed address,uint8,uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                name: "fromLevel",
                type: "uint8",
            },
            {
                indexed: false,
                name: "toLevel",
                type: "uint8",
            },
        ],
        name: "LevelChanged",
        type: "event",
    },
    "AuctionCancelled(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "AuctionCancelled",
        type: "event",
    },
    "ProtocolUpgrade(address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "saleAuction",
                type: "address",
            },
        ],
        name: "ProtocolUpgrade",
        type: "event",
    },
    "OperatorUpdated(address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "op",
                type: "address",
            },
            {
                indexed: false,
                name: "enabled",
                type: "bool",
            },
        ],
        name: "OperatorUpdated",
        type: "event",
    },
    "BlackListUpdated(address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "person",
                type: "address",
            },
            {
                indexed: false,
                name: "op",
                type: "bool",
            },
        ],
        name: "BlackListUpdated",
        type: "event",
    },
    "PairCreated(indexed address,indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "token0",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "token1",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "pair",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "PairCreated",
        type: "event",
    },
    "ClaimGeneratedVTHO(address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "ClaimGeneratedVTHO",
        type: "event",
    },
    "Config(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reserveBalance",
                type: "uint256",
            },
        ],
        name: "Config",
        type: "event",
    },
    "FetchGas(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "baseGasPrice",
                type: "uint256",
            },
        ],
        name: "FetchGas",
        type: "event",
    },
    "SetFee(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "feeMultiplier",
                type: "uint256",
            },
        ],
        name: "SetFee",
        type: "event",
    },
    "Swap(indexed address,indexed address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "router",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "withdrawAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "gasPrice",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "feeMultiplier",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "protocolFee",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountOutExpected",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountOutReceived",
                type: "uint256",
            },
        ],
        name: "Swap",
        type: "event",
    },
    "WithdrawFees(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "WithdrawFees",
        type: "event",
    },
    "FunctionWhitelisted(indexed address,indexed bytes4,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "target",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes4",
                name: "functionSelector",
                type: "bytes4",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isWhitelisted",
                type: "bool",
            },
        ],
        name: "FunctionWhitelisted",
        type: "event",
    },
    "ProposalCanceled(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
        ],
        name: "ProposalCanceled",
        type: "event",
    },
    "ProposalCreated(indexed uint256,indexed address,address[],uint256[],string[],bytes[],string,indexed uint256,uint256)":
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "proposalId",
                    type: "uint256",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "proposer",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "address[]",
                    name: "targets",
                    type: "address[]",
                },
                {
                    indexed: false,
                    internalType: "uint256[]",
                    name: "values",
                    type: "uint256[]",
                },
                {
                    indexed: false,
                    internalType: "string[]",
                    name: "signatures",
                    type: "string[]",
                },
                {
                    indexed: false,
                    internalType: "bytes[]",
                    name: "calldatas",
                    type: "bytes[]",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "description",
                    type: "string",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "roundIdVoteStart",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "depositThreshold",
                    type: "uint256",
                },
            ],
            name: "ProposalCreated",
            type: "event",
        },
    "ProposalDeposit(indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "depositor",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "ProposalDeposit",
        type: "event",
    },
    "ProposalExecuted(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
        ],
        name: "ProposalExecuted",
        type: "event",
    },
    "ProposalQueued(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "etaSeconds",
                type: "uint256",
            },
        ],
        name: "ProposalQueued",
        type: "event",
    },
    "QuadraticVotingToggled(indexed bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bool",
                name: "disabled",
                type: "bool",
            },
        ],
        name: "QuadraticVotingToggled",
        type: "event",
    },
    "QuorumNumeratorUpdated(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldNumerator",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newNumerator",
                type: "uint256",
            },
        ],
        name: "QuorumNumeratorUpdated",
        type: "event",
    },
    "TimelockChange(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldTimelock",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newTimelock",
                type: "address",
            },
        ],
        name: "TimelockChange",
        type: "event",
    },
    "VeBetterPassportSet(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldVeBetterPassport",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newVeBetterPassport",
                type: "address",
            },
        ],
        name: "VeBetterPassportSet",
        type: "event",
    },
    "VoteCast(indexed address,indexed uint256,uint8,uint256,uint256,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "voter",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "support",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "weight",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "power",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "VoteCast",
        type: "event",
    },
    "EmissionCycleDurationUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newDuration",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldDuration",
                type: "uint256",
            },
        ],
        name: "EmissionCycleDurationUpdated",
        type: "event",
    },
    "EmissionDistributed(indexed uint256,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "cycle",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "xAllocations",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "vote2Earn",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "treasury",
                type: "uint256",
            },
        ],
        name: "EmissionDistributed",
        type: "event",
    },
    "MaxVote2EarnDecayUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newDecay",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldDecay",
                type: "uint256",
            },
        ],
        name: "MaxVote2EarnDecayUpdated",
        type: "event",
    },
    "TreasuryAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "TreasuryAddressUpdated",
        type: "event",
    },
    "TreasuryPercentageUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newPercentage",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldPercentage",
                type: "uint256",
            },
        ],
        name: "TreasuryPercentageUpdated",
        type: "event",
    },
    "Vote2EarnAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "Vote2EarnAddressUpdated",
        type: "event",
    },
    "Vote2EarnDecayPeriodUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newPeriod",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldPeriod",
                type: "uint256",
            },
        ],
        name: "Vote2EarnDecayPeriodUpdated",
        type: "event",
    },
    "Vote2EarnDecayUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newDecay",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldDecay",
                type: "uint256",
            },
        ],
        name: "Vote2EarnDecayUpdated",
        type: "event",
    },
    "XAllocationsAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "XAllocationsAddressUpdated",
        type: "event",
    },
    "XAllocationsDecayPeriodUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newPeriod",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldPeriod",
                type: "uint256",
            },
        ],
        name: "XAllocationsDecayPeriodUpdated",
        type: "event",
    },
    "XAllocationsDecayUpdated(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "newDecay",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "oldDecay",
                type: "uint256",
            },
        ],
        name: "XAllocationsDecayUpdated",
        type: "event",
    },
    "XAllocationsGovernorAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "XAllocationsGovernorAddressUpdated",
        type: "event",
    },
    "B3TRtoUpgradeToLevelUpdated(indexed uint256[])": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256[]",
                name: "b3trToUpgradeToLevel",
                type: "uint256[]",
            },
        ],
        name: "B3TRtoUpgradeToLevelUpdated",
        type: "event",
    },
    "B3trGovernorAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "B3trGovernorAddressUpdated",
        type: "event",
    },
    "BaseURIUpdated(indexed string,indexed string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "string",
                name: "newBaseURI",
                type: "string",
            },
            {
                indexed: true,
                internalType: "string",
                name: "oldBaseURI",
                type: "string",
            },
        ],
        name: "BaseURIUpdated",
        type: "event",
    },
    "MaxLevelUpdated(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldLevel",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newLevel",
                type: "uint256",
            },
        ],
        name: "MaxLevelUpdated",
        type: "event",
    },
    "NodeAttached(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "nodeTokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "NodeAttached",
        type: "event",
    },
    "NodeDetached(indexed uint256,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "nodeTokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "NodeDetached",
        type: "event",
    },
    "PublicMintingPaused(bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bool",
                name: "isPaused",
                type: "bool",
            },
        ],
        name: "PublicMintingPaused",
        type: "event",
    },
    "Selected(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Selected",
        type: "event",
    },
    "Upgraded(indexed uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "oldLevel",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newLevel",
                type: "uint256",
            },
        ],
        name: "Upgraded",
        type: "event",
    },
    "NodeDelegated(indexed uint256,indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "nodeId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "delegatee",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "delegated",
                type: "bool",
            },
        ],
        name: "NodeDelegated",
        type: "event",
    },
    "VechainNodeContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "VechainNodeContractSet",
        type: "event",
    },
    "CallExecuted(indexed bytes32,indexed uint256,address,uint256,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "target",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "CallExecuted",
        type: "event",
    },
    "CallSalt(indexed bytes32,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "salt",
                type: "bytes32",
            },
        ],
        name: "CallSalt",
        type: "event",
    },
    "CallScheduled(indexed bytes32,indexed uint256,address,uint256,bytes,bytes32,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "target",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "predecessor",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "delay",
                type: "uint256",
            },
        ],
        name: "CallScheduled",
        type: "event",
    },
    "Cancelled(indexed bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "Cancelled",
        type: "event",
    },
    "MinDelayChange(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldDuration",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newDuration",
                type: "uint256",
            },
        ],
        name: "MinDelayChange",
        type: "event",
    },
    "TransferLimitUpdated(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "limit",
                type: "uint256",
            },
        ],
        name: "TransferLimitUpdated",
        type: "event",
    },
    "TransferLimitVETUpdated(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "limit",
                type: "uint256",
            },
        ],
        name: "TransferLimitVETUpdated",
        type: "event",
    },
    "CheckToggled(indexed string,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "string",
                name: "checkName",
                type: "string",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "enabled",
                type: "bool",
            },
        ],
        name: "CheckToggled",
        type: "event",
    },
    "DelegationCreated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "delegator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "delegatee",
                type: "address",
            },
        ],
        name: "DelegationCreated",
        type: "event",
    },
    "DelegationPending(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "delegator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "delegatee",
                type: "address",
            },
        ],
        name: "DelegationPending",
        type: "event",
    },
    "DelegationRevoked(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "delegator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "delegatee",
                type: "address",
            },
        ],
        name: "DelegationRevoked",
        type: "event",
    },
    "LinkCreated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "entity",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "passport",
                type: "address",
            },
        ],
        name: "LinkCreated",
        type: "event",
    },
    "LinkPending(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "entity",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "passport",
                type: "address",
            },
        ],
        name: "LinkPending",
        type: "event",
    },
    "LinkRemoved(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "entity",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "passport",
                type: "address",
            },
        ],
        name: "LinkRemoved",
        type: "event",
    },
    "MinimumGalaxyMemberLevelSet(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "minimumGalaxyMemberLevel",
                type: "uint256",
            },
        ],
        name: "MinimumGalaxyMemberLevelSet",
        type: "event",
    },
    "RegisteredAction(indexed address,address,indexed bytes32,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "passport",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "round",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "actionScore",
                type: "uint256",
            },
        ],
        name: "RegisteredAction",
        type: "event",
    },
    "RemovedUserFromBlacklist(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "removedBy",
                type: "address",
            },
        ],
        name: "RemovedUserFromBlacklist",
        type: "event",
    },
    "RemovedUserFromWhitelist(indexed address,indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "passport",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "removedBy",
                type: "address",
            },
        ],
        name: "RemovedUserFromWhitelist",
        type: "event",
    },
    "SignalerAssignedToApp(indexed address,indexed bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "signaler",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "app",
                type: "bytes32",
            },
        ],
        name: "SignalerAssignedToApp",
        type: "event",
    },
    "SignalerRemovedFromApp(indexed address,indexed bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "signaler",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "app",
                type: "bytes32",
            },
        ],
        name: "SignalerRemovedFromApp",
        type: "event",
    },
    "UserBlacklisted(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "blacklistedBy",
                type: "address",
            },
        ],
        name: "UserBlacklisted",
        type: "event",
    },
    "UserSignaled(indexed address,indexed address,indexed bytes32,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "signaler",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "app",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "UserSignaled",
        type: "event",
    },
    "UserSignalsReset(indexed address,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "UserSignalsReset",
        type: "event",
    },
    "UserSignalsResetForApp(indexed address,indexed bytes32,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "app",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "UserSignalsResetForApp",
        type: "event",
    },
    "UserWhitelisted(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "whitelistedBy",
                type: "address",
            },
        ],
        name: "UserWhitelisted",
        type: "event",
    },
    "DelegateChanged(indexed address,indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "delegator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "fromDelegate",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "toDelegate",
                type: "address",
            },
        ],
        name: "DelegateChanged",
        type: "event",
    },
    "DelegateVotesChanged(indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "delegate",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "previousVotes",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newVotes",
                type: "uint256",
            },
        ],
        name: "DelegateVotesChanged",
        type: "event",
    },
    EIP712DomainChanged: {
        anonymous: false,
        inputs: [],
        name: "EIP712DomainChanged",
        type: "event",
    },
    "EmissionsAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "EmissionsAddressUpdated",
        type: "event",
    },
    "GMVoteRegistered(indexed uint256,indexed uint256,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "cycle",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "level",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "multiplier",
                type: "uint256",
            },
        ],
        name: "GMVoteRegistered",
        type: "event",
    },
    "GalaxyMemberAddressUpdated(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
        ],
        name: "GalaxyMemberAddressUpdated",
        type: "event",
    },
    "LevelToMultiplierPending(indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "level",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "multiplier",
                type: "uint256",
            },
        ],
        name: "LevelToMultiplierPending",
        type: "event",
    },
    "LevelToMultiplierSet(indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "level",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "multiplier",
                type: "uint256",
            },
        ],
        name: "LevelToMultiplierSet",
        type: "event",
    },
    "QuadraticRewardingToggled(indexed bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bool",
                name: "disabled",
                type: "bool",
            },
        ],
        name: "QuadraticRewardingToggled",
        type: "event",
    },
    "RewardClaimed(indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "cycle",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "voter",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
        ],
        name: "RewardClaimed",
        type: "event",
    },
    "RewardClaimedV2(indexed uint256,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "cycle",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "voter",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "gmReward",
                type: "uint256",
            },
        ],
        name: "RewardClaimedV2",
        type: "event",
    },
    "VoteRegistered(indexed uint256,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "cycle",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "voter",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "votes",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardWeightedVote",
                type: "uint256",
            },
        ],
        name: "VoteRegistered",
        type: "event",
    },
    "NewDeposit(uint256,indexed bytes32,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "depositor",
                type: "address",
            },
        ],
        name: "NewDeposit",
        type: "event",
    },
    "RegisterActionFailed(string,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "lowLevelData",
                type: "bytes",
            },
        ],
        name: "RegisterActionFailed",
        type: "event",
    },
    "RewardDistributed(uint256,indexed bytes32,indexed address,string,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "proof",
                type: "string",
            },
            {
                indexed: true,
                internalType: "address",
                name: "distributor",
                type: "address",
            },
        ],
        name: "RewardDistributed",
        type: "event",
    },
    "TeamWithdrawal(uint256,indexed bytes32,indexed address,address,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "teamWallet",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "withdrawer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "TeamWithdrawal",
        type: "event",
    },
    "AppAdded(indexed bytes32,address,string,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addr",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "appAvailableForAllocationVoting",
                type: "bool",
            },
        ],
        name: "AppAdded",
        type: "event",
    },
    "AppAdminUpdated(indexed bytes32,address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "oldAdmin",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
        ],
        name: "AppAdminUpdated",
        type: "event",
    },
    "AppEndorsed(indexed bytes32,uint256,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "nodeId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "endorsed",
                type: "bool",
            },
        ],
        name: "AppEndorsed",
        type: "event",
    },
    "AppEndorsementStatusUpdated(indexed bytes32,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "endorsed",
                type: "bool",
            },
        ],
        name: "AppEndorsementStatusUpdated",
        type: "event",
    },
    "AppMetadataURIUpdated(indexed bytes32,string,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "string",
                name: "oldMetadataURI",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "newMetadataURI",
                type: "string",
            },
        ],
        name: "AppMetadataURIUpdated",
        type: "event",
    },
    "AppUnendorsedGracePeriodStarted(indexed bytes32,uint48,uint48)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "startBlock",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "endBlock",
                type: "uint48",
            },
        ],
        name: "AppUnendorsedGracePeriodStarted",
        type: "event",
    },
    "BlacklistUpdated(indexed bytes32,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isBlacklisted",
                type: "bool",
            },
        ],
        name: "BlacklistUpdated",
        type: "event",
    },
    "CreatorAddedToApp(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "creatorAddress",
                type: "address",
            },
        ],
        name: "CreatorAddedToApp",
        type: "event",
    },
    "EndorsementScoreThresholdUpdated(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldThreshold",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newThreshold",
                type: "uint256",
            },
        ],
        name: "EndorsementScoreThresholdUpdated",
        type: "event",
    },
    "GracePeriodUpdated(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldGracePeriod",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newGracePeriod",
                type: "uint256",
            },
        ],
        name: "GracePeriodUpdated",
        type: "event",
    },
    "ModeratorAddedToApp(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "moderator",
                type: "address",
            },
        ],
        name: "ModeratorAddedToApp",
        type: "event",
    },
    "ModeratorRemovedFromApp(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "moderator",
                type: "address",
            },
        ],
        name: "ModeratorRemovedFromApp",
        type: "event",
    },
    "NodeStrengthScoresUpdated(indexed tuple)": {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "strength",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "thunder",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "mjolnir",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "veThorX",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "strengthX",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "thunderX",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "mjolnirX",
                        type: "uint256",
                    },
                ],
                indexed: true,
                internalType: "struct VechainNodesDataTypes.NodeStrengthScores",
                name: "nodeStrengthScores",
                type: "tuple",
            },
        ],
        name: "NodeStrengthScoresUpdated",
        type: "event",
    },
    "RewardDistributorAddedToApp(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "distributorAddress",
                type: "address",
            },
        ],
        name: "RewardDistributorAddedToApp",
        type: "event",
    },
    "RewardDistributorRemovedFromApp(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "distributorAddress",
                type: "address",
            },
        ],
        name: "RewardDistributorRemovedFromApp",
        type: "event",
    },
    "TeamAllocationPercentageUpdated(indexed bytes32,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "oldPercentage",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newPercentage",
                type: "uint256",
            },
        ],
        name: "TeamAllocationPercentageUpdated",
        type: "event",
    },
    "TeamWalletAddressUpdated(indexed bytes32,address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "oldTeamWalletAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newTeamWalletAddress",
                type: "address",
            },
        ],
        name: "TeamWalletAddressUpdated",
        type: "event",
    },
    "VotingEligibilityUpdated(indexed bytes32,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isAvailable",
                type: "bool",
            },
        ],
        name: "VotingEligibilityUpdated",
        type: "event",
    },
    "AllocationRewardsClaimed(indexed bytes32,uint256,uint256,indexed address,address,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "roundId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalAmount",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "caller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "unallocatedAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "teamAllocationAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardsAllocationAmount",
                type: "uint256",
            },
        ],
        name: "AllocationRewardsClaimed",
        type: "event",
    },
    "EmissionsContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "EmissionsContractSet",
        type: "event",
    },
    "QuadraticFundingToggled(indexed bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bool",
                name: "isDisabled",
                type: "bool",
            },
        ],
        name: "QuadraticFundingToggled",
        type: "event",
    },
    "TreasuryContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "TreasuryContractSet",
        type: "event",
    },
    "X2EarnAppsContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "X2EarnAppsContractSet",
        type: "event",
    },
    "XAllocationVotingSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "XAllocationVotingSet",
        type: "event",
    },
    "AllocationVoteCast(indexed address,indexed uint256,bytes32[],uint256[])": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "voter",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "roundId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes32[]",
                name: "appsIds",
                type: "bytes32[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "voteWeights",
                type: "uint256[]",
            },
        ],
        name: "AllocationVoteCast",
        type: "event",
    },
    "EmissionsSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "EmissionsSet",
        type: "event",
    },
    "RoundCreated(uint256,address,uint256,uint256,bytes32[])": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "roundId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "proposer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "voteStart",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "voteEnd",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes32[]",
                name: "appsIds",
                type: "bytes32[]",
            },
        ],
        name: "RoundCreated",
        type: "event",
    },
    "VeBetterPassportSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "VeBetterPassportSet",
        type: "event",
    },
    "VoterRewardsSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "VoterRewardsSet",
        type: "event",
    },
    "VotingPeriodSet(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldVotingPeriod",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newVotingPeriod",
                type: "uint256",
            },
        ],
        name: "VotingPeriodSet",
        type: "event",
    },
    "VotingThresholdSet(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "oldVotingThreshold",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newVotingThreshold",
                type: "uint256",
            },
        ],
        name: "VotingThresholdSet",
        type: "event",
    },
    "X2EarnAppsSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "X2EarnAppsSet",
        type: "event",
    },
    "Confirmation(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "fromAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "messageId",
                type: "uint256",
            },
        ],
        name: "Confirmation",
        type: "event",
    },
    "Message(indexed address,indexed address,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "fromAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "toAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "message",
                type: "string",
            },
        ],
        name: "Message",
        type: "event",
    },
    "SexyTime(indexed address,indexed uint256,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "maleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "femaleId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "SexyTime",
        type: "event",
    },
    "TokenBurnt(indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "TokenBurnt",
        type: "event",
    },
    "TokenMinted(indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "TokenMinted",
        type: "event",
    },
    "RewardPaid(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
        ],
        name: "RewardPaid",
        type: "event",
    },
    "Staked(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Staked",
        type: "event",
    },
    "Unstaked(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Unstaked",
        type: "event",
    },
    "FundsClaimed(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "ownerAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "FundsClaimed",
        type: "event",
    },
    "RandomNumber(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "number",
                type: "uint256",
            },
        ],
        name: "RandomNumber",
        type: "event",
    },
    "Roll(indexed uint256,indexed address,bool,uint256,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "gameNumber",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "ownerAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "win",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "playAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "winAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "odds",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "roll",
                type: "uint256",
            },
        ],
        name: "Roll",
        type: "event",
    },
    "Claimed(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "ownerAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Claimed",
        type: "event",
    },
    "Deposit(indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Deposit",
        type: "event",
    },
    "ForceWithdraw(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sentTo",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ForceWithdraw",
        type: "event",
    },
    "Swap(indexed address,indexed address,indexed uint256,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "playerAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "prizeNftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "prizeTokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "swapNftAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "swapTokenId",
                type: "uint256",
            },
        ],
        name: "Swap",
        type: "event",
    },
    "ForceItemCanceled(indexed address,indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
        ],
        name: "ForceItemCanceled",
        type: "event",
    },
    "ItemBought(indexed address,indexed uint256,address,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "ItemBought",
        type: "event",
    },
    "ItemCanceled(indexed address,indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
        ],
        name: "ItemCanceled",
        type: "event",
    },
    "ItemCreated(indexed address,indexed uint256,indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "ItemCreated",
        type: "event",
    },
    "ItemEdited(indexed address,indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newPrice",
                type: "uint256",
            },
        ],
        name: "ItemEdited",
        type: "event",
    },
    "ItemSold(indexed address,indexed uint256,indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "ItemSold",
        type: "event",
    },
    "CollectionOfferAccepted(indexed address,indexed uint256,indexed address,address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "remainingQty",
                type: "uint256",
            },
        ],
        name: "CollectionOfferAccepted",
        type: "event",
    },
    "CollectionOfferCreated(indexed address,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "qty",
                type: "uint256",
            },
        ],
        name: "CollectionOfferCreated",
        type: "event",
    },
    "CollectionOfferEdited(indexed address,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "qty",
                type: "uint256",
            },
        ],
        name: "CollectionOfferEdited",
        type: "event",
    },
    "CollectionOfferForceWithdrawn(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
        ],
        name: "CollectionOfferForceWithdrawn",
        type: "event",
    },
    "CollectionOfferWithdrawn(indexed address,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
        ],
        name: "CollectionOfferWithdrawn",
        type: "event",
    },
    "OfferAccepted(indexed address,indexed uint256,indexed address,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "OfferAccepted",
        type: "event",
    },
    "OfferCreated(indexed address,indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "OfferCreated",
        type: "event",
    },
    "OfferForceWithdrawn(indexed address,indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
        ],
        name: "OfferForceWithdrawn",
        type: "event",
    },
    "OfferOverbid(indexed address,indexed uint256,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "priceBefore",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newPrice",
                type: "uint256",
            },
        ],
        name: "OfferOverbid",
        type: "event",
    },
    "OfferPriceEdited(indexed address,indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "OfferPriceEdited",
        type: "event",
    },
    "OfferRejected(indexed address,indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "OfferRejected",
        type: "event",
    },
    "OfferWithdrawn(indexed address,indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
        ],
        name: "OfferWithdrawn",
        type: "event",
    },
    "BadgeAdded(indexed address,indexed string,indexed string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "badgeName",
                type: "string",
            },
            {
                indexed: true,
                internalType: "string",
                name: "badgeSet",
                type: "string",
            },
        ],
        name: "BadgeAdded",
        type: "event",
    },
    "BadgeRemoved(indexed address,indexed string,indexed string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "badgeName",
                type: "string",
            },
            {
                indexed: true,
                internalType: "string",
                name: "badgeSet",
                type: "string",
            },
        ],
        name: "BadgeRemoved",
        type: "event",
    },
    "ProfileCreated(indexed address,indexed string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "ProfileCreated",
        type: "event",
    },
    "ProfileDeleted(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
        ],
        name: "ProfileDeleted",
        type: "event",
    },
    "ProfileKvpRemoved(indexed address,indexed string,indexed string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "kvpType",
                type: "string",
            },
            {
                indexed: true,
                internalType: "string",
                name: "key",
                type: "string",
            },
        ],
        name: "ProfileKvpRemoved",
        type: "event",
    },
    "ProfileKvpSet(indexed address,indexed string,indexed string,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "kvpType",
                type: "string",
            },
            {
                indexed: true,
                internalType: "string",
                name: "key",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "value",
                type: "string",
            },
        ],
        name: "ProfileKvpSet",
        type: "event",
    },
    "ProfileUpdated(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "profileAddress",
                type: "address",
            },
        ],
        name: "ProfileUpdated",
        type: "event",
    },
    "ExpiryExtended(indexed bytes32,uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint64",
                name: "expiry",
                type: "uint64",
            },
        ],
        name: "ExpiryExtended",
        type: "event",
    },
    "FusesSet(indexed bytes32,uint32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "fuses",
                type: "uint32",
            },
        ],
        name: "FusesSet",
        type: "event",
    },
    "NameUnwrapped(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "NameUnwrapped",
        type: "event",
    },
    "NameWrapped(indexed bytes32,bytes,address,uint32,uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "name",
                type: "bytes",
            },
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "fuses",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint64",
                name: "expiry",
                type: "uint64",
            },
        ],
        name: "NameWrapped",
        type: "event",
    },
    "TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "ids",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "values",
                type: "uint256[]",
            },
        ],
        name: "TransferBatch",
        type: "event",
    },
    "TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "TransferSingle",
        type: "event",
    },
    "URI(string,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "value",
                type: "string",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
        ],
        name: "URI",
        type: "event",
    },
    "ControllerAdded(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "controller",
                type: "address",
            },
        ],
        name: "ControllerAdded",
        type: "event",
    },
    "ControllerRemoved(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "controller",
                type: "address",
            },
        ],
        name: "ControllerRemoved",
        type: "event",
    },
    "NameRegistered(indexed uint256,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "expires",
                type: "uint256",
            },
        ],
        name: "NameRegistered",
        type: "event",
    },
    "NameRenewed(indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "expires",
                type: "uint256",
            },
        ],
        name: "NameRenewed",
        type: "event",
    },
    "ABIChanged(indexed bytes32,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "contentType",
                type: "uint256",
            },
        ],
        name: "ABIChanged",
        type: "event",
    },
    "AddrChanged(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "a",
                type: "address",
            },
        ],
        name: "AddrChanged",
        type: "event",
    },
    "AddressChanged(indexed bytes32,uint256,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "coinType",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "newAddress",
                type: "bytes",
            },
        ],
        name: "AddressChanged",
        type: "event",
    },
    "Approved(address,indexed bytes32,indexed address,indexed bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "delegate",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "Approved",
        type: "event",
    },
    "ContenthashChanged(indexed bytes32,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "hash",
                type: "bytes",
            },
        ],
        name: "ContenthashChanged",
        type: "event",
    },
    "DNSRecordChanged(indexed bytes32,bytes,uint16,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "name",
                type: "bytes",
            },
            {
                indexed: false,
                internalType: "uint16",
                name: "resource",
                type: "uint16",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "record",
                type: "bytes",
            },
        ],
        name: "DNSRecordChanged",
        type: "event",
    },
    "DNSRecordDeleted(indexed bytes32,bytes,uint16)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "name",
                type: "bytes",
            },
            {
                indexed: false,
                internalType: "uint16",
                name: "resource",
                type: "uint16",
            },
        ],
        name: "DNSRecordDeleted",
        type: "event",
    },
    "DNSZonehashChanged(indexed bytes32,bytes,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "lastzonehash",
                type: "bytes",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "zonehash",
                type: "bytes",
            },
        ],
        name: "DNSZonehashChanged",
        type: "event",
    },
    "InterfaceChanged(indexed bytes32,indexed bytes4,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes4",
                name: "interfaceID",
                type: "bytes4",
            },
            {
                indexed: false,
                internalType: "address",
                name: "implementer",
                type: "address",
            },
        ],
        name: "InterfaceChanged",
        type: "event",
    },
    "NameChanged(indexed bytes32,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "NameChanged",
        type: "event",
    },
    "PubkeyChanged(indexed bytes32,bytes32,bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "x",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "y",
                type: "bytes32",
            },
        ],
        name: "PubkeyChanged",
        type: "event",
    },
    "TextChanged(indexed bytes32,indexed string,string,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "string",
                name: "indexedKey",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "key",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "value",
                type: "string",
            },
        ],
        name: "TextChanged",
        type: "event",
    },
    "VersionChanged(indexed bytes32,uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint64",
                name: "newVersion",
                type: "uint64",
            },
        ],
        name: "VersionChanged",
        type: "event",
    },
    "NameRegistered(string,indexed bytes32,indexed address,uint256,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "label",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "baseCost",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "premium",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "expires",
                type: "uint256",
            },
        ],
        name: "NameRegistered",
        type: "event",
    },
    "NameRenewed(string,indexed bytes32,uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "label",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "cost",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "expires",
                type: "uint256",
            },
        ],
        name: "NameRenewed",
        type: "event",
    },
    "NewOwner(indexed bytes32,indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "label",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "NewOwner",
        type: "event",
    },
    "NewResolver(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "resolver",
                type: "address",
            },
        ],
        name: "NewResolver",
        type: "event",
    },
    "NewTTL(indexed bytes32,uint64)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint64",
                name: "ttl",
                type: "uint64",
            },
        ],
        name: "NewTTL",
        type: "event",
    },
    "Transfer(indexed bytes32,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    "ControllerChanged(indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "controller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "enabled",
                type: "bool",
            },
        ],
        name: "ControllerChanged",
        type: "event",
    },
    "DefaultResolverChanged(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract NameResolver",
                name: "resolver",
                type: "address",
            },
        ],
        name: "DefaultResolverChanged",
        type: "event",
    },
    "ReverseClaimed(indexed address,indexed bytes32)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addr",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "node",
                type: "bytes32",
            },
        ],
        name: "ReverseClaimed",
        type: "event",
    },
    "MaxChoicesSet(uint8,uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint8",
                name: "oldMaxChoices",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "newMaxChoices",
                type: "uint8",
            },
        ],
        name: "MaxChoicesSet",
        type: "event",
    },
    "MaxVotingDurationSet(uint48,uint48)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint48",
                name: "oldMaxVotingDuration",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "newMaxVotingDuration",
                type: "uint48",
            },
        ],
        name: "MaxVotingDurationSet",
        type: "event",
    },
    "MinStakedAmountUpdated(uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "previousMinStake",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newMinStake",
                type: "uint256",
            },
        ],
        name: "MinStakedAmountUpdated",
        type: "event",
    },
    "MinVotingDelaySet(uint48,uint48)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint48",
                name: "oldMinVotingDelay",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "newMinVotingDelay",
                type: "uint48",
            },
        ],
        name: "MinVotingDelaySet",
        type: "event",
    },
    "MinVotingDurationSet(uint48,uint48)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint48",
                name: "oldMinVotingDuration",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "newMinVotingDuration",
                type: "uint48",
            },
        ],
        name: "MinVotingDurationSet",
        type: "event",
    },
    "NodeManagementContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "NodeManagementContractSet",
        type: "event",
    },
    "ProposalCanceled(uint256,address,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "canceller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "ProposalCanceled",
        type: "event",
    },
    "StargateNFTContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "StargateNFTContractSet",
        type: "event",
    },
    "ValidatorContractSet(address,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldContractAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newContractAddress",
                type: "address",
            },
        ],
        name: "ValidatorContractSet",
        type: "event",
    },
    "VeVoteProposalCreated(indexed uint256,indexed address,string,uint48,uint48,bytes32[],uint8,uint8)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "proposer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "description",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "startBlock",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "voteDuration",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "bytes32[]",
                name: "choices",
                type: "bytes32[]",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "maxSelection",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "minSelection",
                type: "uint8",
            },
        ],
        name: "VeVoteProposalCreated",
        type: "event",
    },
    "VeVoteProposalExecuted(uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
        ],
        name: "VeVoteProposalExecuted",
        type: "event",
    },
    "VoteCast(indexed address,indexed uint256,uint32,uint256,string,uint256[],address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "voter",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "choices",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "weight",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "reason",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "stargateNFTs",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "address",
                name: "validator",
                type: "address",
            },
        ],
        name: "VoteCast",
        type: "event",
    },
    "VoteMultipliersUpdated(uint256[])": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256[]",
                name: "updatedMultipliers",
                type: "uint256[]",
            },
        ],
        name: "VoteMultipliersUpdated",
        type: "event",
    },
    "NewProposal(indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "creator",
                type: "address",
            },
        ],
        name: "NewProposal",
        type: "event",
    },
    "ProposalConditionChanged(indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
        ],
        name: "ProposalConditionChanged",
        type: "event",
    },
    "ProposalWhitelist(indexed uint256,indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "visitor",
                type: "address",
            },
        ],
        name: "ProposalWhitelist",
        type: "event",
    },
    "NewVote(indexed uint256,indexed address,uint16)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "proposalId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "voter",
                type: "address",
            },
            {
                indexed: false,
                name: "options",
                type: "uint16",
            },
        ],
        name: "NewVote",
        type: "event",
    },
    "BlockList(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_badGuy",
                type: "address",
            },
        ],
        name: "BlockList",
        type: "event",
    },
    "RemoveFromBlockList(indexed address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_innocent",
                type: "address",
            },
        ],
        name: "RemoveFromBlockList",
        type: "event",
    },
    "BelongsToChanged(address)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "newBelongsTo",
                type: "address",
            },
        ],
        name: "BelongsToChanged",
        type: "event",
    },
    "Mintable(bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bool",
                name: "enabled",
                type: "bool",
            },
        ],
        name: "Mintable",
        type: "event",
    },
    "NameChanged(string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "NameChanged",
        type: "event",
    },
    "SymbolChanged(string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "symbol",
                type: "string",
            },
        ],
        name: "SymbolChanged",
        type: "event",
    },
    "Application(indexed address,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "asker",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Application",
        type: "event",
    },
    "OwnerFrozen(indexed address,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "blocked",
                type: "bool",
            },
        ],
        name: "OwnerFrozen",
        type: "event",
    },
    "TokenFrozen(indexed uint256,bool)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "blocked",
                type: "bool",
            },
        ],
        name: "TokenFrozen",
        type: "event",
    },
    "TokenTransfer(indexed address,indexed address,indexed uint256,bytes)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "TokenTransfer",
        type: "event",
    },
    "BaseURIChanged(string)": {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "baseuri",
                type: "string",
            },
        ],
        name: "BaseURIChanged",
        type: "event",
    },
    "Approval(indexed address,indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    "TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[],string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "ids",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "values",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "string",
                name: "data",
                type: "string",
            },
        ],
        name: "TransferBatch",
        type: "event",
    },
    "TransferSingle(indexed address,indexed address,indexed address,uint256,uint256,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "data",
                type: "string",
            },
        ],
        name: "TransferSingle",
        type: "event",
    },
    "ClaimVTHO(indexed address,indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "src",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "dst",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "wad",
                type: "uint256",
            },
        ],
        name: "ClaimVTHO",
        type: "event",
    },
    "Deposit(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "dst",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "wad",
                type: "uint256",
            },
        ],
        name: "Deposit",
        type: "event",
    },
    "Withdrawal(indexed address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "src",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "wad",
                type: "uint256",
            },
        ],
        name: "Withdrawal",
        type: "event",
    },
    "cancel(indexed uint256,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "saleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "cancel",
        type: "event",
    },
    "listing(indexed uint256,indexed address,indexed uint256,address,uint256,uint256,bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "saleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startingTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isVIP180",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "listing",
        type: "event",
    },
    "purchase(indexed uint256,indexed address,indexed uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "saleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
        ],
        name: "purchase",
        type: "event",
    },
    "CloseBuyOffer(indexed uint256,indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "offerType",
                type: "uint256",
            },
        ],
        name: "CloseBuyOffer",
        type: "event",
    },
    "NewBuyOffer(indexed uint256,indexed address,indexed uint256,uint256,uint256,uint256,uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "offerType",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "NewBuyOffer",
        type: "event",
    },
    "OfferAccepted(indexed uint256,indexed address,indexed uint256,uint256,address,uint256,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "offerId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "offerType",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "vip180",
                type: "address",
            },
        ],
        name: "OfferAccepted",
        type: "event",
    },
    "auctionExecuted(indexed uint256,indexed address,indexed uint256,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "auctionExecuted",
        type: "event",
    },
    "cancelAuctionEvent(indexed uint256,indexed address,indexed uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "cancelAuctionEvent",
        type: "event",
    },
    "newAuction(indexed uint256,indexed address,indexed uint256,address,uint256,uint256,uint256,bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startingTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isVIP180",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "newAuction",
        type: "event",
    },
    "newBid(indexed uint256,indexed address,indexed uint256,address,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "maxBidUser",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "maxBid",
                type: "uint256",
            },
        ],
        name: "newBid",
        type: "event",
    },
    "timeUpdate(indexed uint256,indexed address,indexed uint256,uint256)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "auctionId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newEndTime",
                type: "uint256",
            },
        ],
        name: "timeUpdate",
        type: "event",
    },
    "NameChange(indexed uint256,string)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "wovIndex",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "newName",
                type: "string",
            },
        ],
        name: "NameChange",
        type: "event",
    },
    "cancelNonCustodial(indexed uint256,indexed address,indexed uint256,address,uint256,uint256,bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "saleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startingTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isVIP180",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "cancelNonCustodial",
        type: "event",
    },
    "listingNonCustodial(indexed uint256,indexed address,indexed uint256,address,uint256,uint256,bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "saleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startingTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isVIP180",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "listingNonCustodial",
        type: "event",
    },
    "purchaseNonCustodial(indexed uint256,indexed address,indexed uint256,address,uint256,uint256,bool,address)": {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "saleId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nft",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startingTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isVIP180",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "address",
                name: "addressVIP180",
                type: "address",
            },
        ],
        name: "purchaseNonCustodial",
        type: "event",
    },
} as const
