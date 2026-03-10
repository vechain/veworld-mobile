const abi = {
    "Transfer(indexed address,indexed address,uint256)": {
        anonymous: false,
        type: "event",
        name: "Transfer",
        inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
        ],
    },
    "RewardDistributed(uint256,indexed bytes32,indexed address,string,indexed address)": {
        anonymous: false,
        type: "event",
        name: "RewardDistributed",
        inputs: [
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: true, name: "appId", type: "bytes32" },
            { indexed: true, name: "receiver", type: "address" },
            { indexed: false, name: "proof", type: "string" },
            { indexed: true, name: "distributor", type: "address" },
        ],
    },
}

export default abi
