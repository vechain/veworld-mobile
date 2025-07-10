import { abi } from "thor-devkit"

type StargateTokenKeys =
    | "approve"
    | "balanceOf"
    | "getApproved"
    | "isApprovedForAll"
    | "name"
    | "ownerOf"
    | "safeTransferFrom"
    | "safeTransferFromWithData"
    | "setApprovalForAll"
    | "symbol"
    | "tokenURI"
    | "totalSupply"
    | "transferFrom"
    | "tokenByIndex"
    | "tokenOfOwnerByIndex"
type StargateStakingKeys =
    | "stake"
    | "stakeAndDelegate"
    | "unstake"
    | "migrate"
    | "migrateAndDelegate"
    | "_burnCallback"
    | "_safeMintCallback"
type StargateLevelKeys =
    | "addLevel"
    | "updateLevel"
    | "updateLevelCap"
    | "getLevel"
    | "getLevelIds"
    | "getLevels"
    | "getLevelSupply"
    | "getCap"
    | "getCirculatingSupplyAtBlock"
    | "getLevelsCirculatingSupplies"
    | "getLevelsCirculatingSuppliesAtBlock"
type StargateVthoKeys =
    | "claimVetGeneratedVtho"
    | "claimableVetGeneratedVtho"
    | "calculateVTHO"
    | "vthoGenerationEndTimestamp"
    | "setVthoGenerationEndTimestamp"
    | "getLastVetGeneratedVthoClaimTimestamp"
    | "vthoToken"
    | "setVthoToken"
type StargateInfoKeys =
    | "getToken"
    | "getTokenLevel"
    | "canTransfer"
    | "isUnderMaturityPeriod"
    | "isXToken"
    | "isNormalToken"
    | "tokenExists"
    | "idsOwnedBy"
    | "levelsOwnedBy"
    | "tokensOwnedBy"
    | "ownerTotalVetStaked"
    | "normalTokensCount"
    | "xTokensCount"
    | "getCurrentTokenId"
    | "maturityPeriodEndBlock"
type StargateContractStateKeys =
    | "pause"
    | "unpause"
    | "paused"
    | "setBaseURI"
    | "baseURI"
    | "setLegacyNodes"
    | "legacyNodes"
    | "setStargateDelegation"
    | "stargateDelegation"
type StargateLifecycleKeys = "initialize" | "upgradeToAndCall" | "proxiableUUID" | "UPGRADE_INTERFACE_VERSION"
type StargateUtilityKeys = "version" | "supportsInterface" | "clock" | "CLOCK_MODE" | "REWARD_MULTIPLIER_SCALING_FACTOR"

export const StargateTokenManagement = {
    approve: {
        name: "approve",
        type: "function",
        inputs: [
            { name: "to", type: "address", internalType: "address" },
            { name: "tokenId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    balanceOf: {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "owner", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    getApproved: {
        name: "getApproved",
        type: "function",
        inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    isApprovedForAll: {
        name: "isApprovedForAll",
        type: "function",
        inputs: [
            { name: "owner", type: "address", internalType: "address" },
            { name: "operator", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    name: {
        name: "name",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    ownerOf: {
        name: "ownerOf",
        type: "function",
        inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    safeTransferFrom: {
        name: "safeTransferFrom",
        type: "function",
        inputs: [
            { name: "from", type: "address", internalType: "address" },
            { name: "to", type: "address", internalType: "address" },
            { name: "tokenId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    safeTransferFromWithData: {
        name: "safeTransferFrom",
        type: "function",
        inputs: [
            { name: "from", type: "address", internalType: "address" },
            { name: "to", type: "address", internalType: "address" },
            { name: "tokenId", type: "uint256", internalType: "uint256" },
            { name: "data", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    setApprovalForAll: {
        name: "setApprovalForAll",
        type: "function",
        inputs: [
            { name: "operator", type: "address", internalType: "address" },
            { name: "approved", type: "bool", internalType: "bool" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    symbol: {
        name: "symbol",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    tokenURI: {
        name: "tokenURI",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    totalSupply: {
        name: "totalSupply",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    transferFrom: {
        name: "transferFrom",
        type: "function",
        inputs: [
            { name: "from", type: "address", internalType: "address" },
            { name: "to", type: "address", internalType: "address" },
            { name: "tokenId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    tokenByIndex: {
        name: "tokenByIndex",
        type: "function",
        inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    tokenOfOwnerByIndex: {
        name: "tokenOfOwnerByIndex",
        type: "function",
        inputs: [
            { name: "owner", type: "address", internalType: "address" },
            { name: "index", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateTokenKeys, abi.Function.Definition>

export const StargateStaking = {
    stake: {
        name: "stake",
        type: "function",
        inputs: [{ name: "_levelId", type: "uint8", internalType: "uint8" }],
        outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        stateMutability: "payable",
    },
    stakeAndDelegate: {
        name: "stakeAndDelegate",
        type: "function",
        inputs: [
            { name: "_levelId", type: "uint8", internalType: "uint8" },
            { name: "_autorenew", type: "bool", internalType: "bool" },
        ],
        outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        stateMutability: "payable",
    },
    unstake: {
        name: "unstake",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    migrate: {
        name: "migrate",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "payable",
    },
    migrateAndDelegate: {
        name: "migrateAndDelegate",
        type: "function",
        inputs: [
            { name: "_tokenId", type: "uint256", internalType: "uint256" },
            { name: "_autorenew", type: "bool", internalType: "bool" },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    _burnCallback: {
        name: "_burnCallback",
        type: "function",
        inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    _safeMintCallback: {
        name: "_safeMintCallback",
        type: "function",
        inputs: [
            { name: "to", type: "address", internalType: "address" },
            { name: "tokenId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
} as const satisfies Record<StargateStakingKeys, abi.Function.Definition>

export const StargateLevel = {
    addLevel: {
        name: "addLevel",
        type: "function",
        inputs: [
            {
                name: "_levelAndSupply",
                type: "tuple",
                components: [
                    {
                        name: "level",
                        type: "tuple",
                        components: [
                            { name: "name", type: "string", internalType: "string" },
                            { name: "isX", type: "bool", internalType: "bool" },
                            { name: "id", type: "uint8", internalType: "uint8" },
                            { name: "maturityBlocks", type: "uint64", internalType: "uint64" },
                            { name: "scaledRewardFactor", type: "uint64", internalType: "uint64" },
                            { name: "vetAmountRequiredToStake", type: "uint256", internalType: "uint256" },
                        ],
                        internalType: "struct DataTypes.Level",
                    },
                    { name: "circulatingSupply", type: "uint208", internalType: "uint208" },
                    { name: "cap", type: "uint32", internalType: "uint32" },
                ],
                internalType: "struct DataTypes.LevelAndSupply",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    updateLevel: {
        name: "updateLevel",
        type: "function",
        inputs: [
            { name: "_levelId", type: "uint8", internalType: "uint8" },
            { name: "_name", type: "string", internalType: "string" },
            { name: "_isX", type: "bool", internalType: "bool" },
            { name: "_maturityBlocks", type: "uint64", internalType: "uint64" },
            { name: "_scaledRewardFactor", type: "uint64", internalType: "uint64" },
            { name: "_vetAmountRequiredToStake", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    updateLevelCap: {
        name: "updateLevelCap",
        type: "function",
        inputs: [
            { name: "_levelId", type: "uint8", internalType: "uint8" },
            { name: "_cap", type: "uint32", internalType: "uint32" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    getLevel: {
        name: "getLevel",
        type: "function",
        inputs: [{ name: "_levelId", type: "uint8", internalType: "uint8" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "name", type: "string", internalType: "string" },
                    { name: "isX", type: "bool", internalType: "bool" },
                    { name: "id", type: "uint8", internalType: "uint8" },
                    { name: "maturityBlocks", type: "uint64", internalType: "uint64" },
                    { name: "scaledRewardFactor", type: "uint64", internalType: "uint64" },
                    { name: "vetAmountRequiredToStake", type: "uint256", internalType: "uint256" },
                ],
                internalType: "struct DataTypes.Level",
            },
        ],
        stateMutability: "view",
    },
    getLevelIds: {
        name: "getLevelIds",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint8[]", internalType: "uint8[]" }],
        stateMutability: "view",
    },
    getLevels: {
        name: "getLevels",
        type: "function",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    { name: "name", type: "string", internalType: "string" },
                    { name: "isX", type: "bool", internalType: "bool" },
                    { name: "id", type: "uint8", internalType: "uint8" },
                    { name: "maturityBlocks", type: "uint64", internalType: "uint64" },
                    { name: "scaledRewardFactor", type: "uint64", internalType: "uint64" },
                    { name: "vetAmountRequiredToStake", type: "uint256", internalType: "uint256" },
                ],
                internalType: "struct DataTypes.Level[]",
            },
        ],
        stateMutability: "view",
    },
    getLevelSupply: {
        name: "getLevelSupply",
        type: "function",
        inputs: [{ name: "_levelId", type: "uint8", internalType: "uint8" }],
        outputs: [
            { name: "circulating", type: "uint208", internalType: "uint208" },
            { name: "cap", type: "uint32", internalType: "uint32" },
        ],
        stateMutability: "view",
    },
    getCap: {
        name: "getCap",
        type: "function",
        inputs: [{ name: "_levelId", type: "uint8", internalType: "uint8" }],
        outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
        stateMutability: "view",
    },
    getCirculatingSupplyAtBlock: {
        name: "getCirculatingSupplyAtBlock",
        type: "function",
        inputs: [
            { name: "_levelId", type: "uint8", internalType: "uint8" },
            { name: "_blockNumber", type: "uint48", internalType: "uint48" },
        ],
        outputs: [{ name: "", type: "uint208", internalType: "uint208" }],
        stateMutability: "view",
    },
    getLevelsCirculatingSupplies: {
        name: "getLevelsCirculatingSupplies",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint208[]", internalType: "uint208[]" }],
        stateMutability: "view",
    },
    getLevelsCirculatingSuppliesAtBlock: {
        name: "getLevelsCirculatingSuppliesAtBlock",
        type: "function",
        inputs: [{ name: "_blockNumber", type: "uint48", internalType: "uint48" }],
        outputs: [{ name: "", type: "uint208[]", internalType: "uint208[]" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateLevelKeys, abi.Function.Definition>

export const StargateVtho = {
    claimVetGeneratedVtho: {
        name: "claimVetGeneratedVtho",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    claimableVetGeneratedVtho: {
        name: "claimableVetGeneratedVtho",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    calculateVTHO: {
        name: "calculateVTHO",
        type: "function",
        inputs: [
            { name: "_t1", type: "uint48", internalType: "uint48" },
            { name: "_t2", type: "uint48", internalType: "uint48" },
            { name: "_vetAmount", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
    },
    vthoGenerationEndTimestamp: {
        name: "vthoGenerationEndTimestamp",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint48", internalType: "uint48" }],
        stateMutability: "view",
    },
    setVthoGenerationEndTimestamp: {
        name: "setVthoGenerationEndTimestamp",
        type: "function",
        inputs: [{ name: "_vthoGenerationEndTimestamp", type: "uint48", internalType: "uint48" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    getLastVetGeneratedVthoClaimTimestamp: {
        name: "getLastVetGeneratedVthoClaimTimestamp",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint48", internalType: "uint48" }],
        stateMutability: "view",
    },
    vthoToken: {
        name: "vthoToken",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
        stateMutability: "view",
    },
    setVthoToken: {
        name: "setVthoToken",
        type: "function",
        inputs: [{ name: "_vthoToken", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
} as const satisfies Record<StargateVthoKeys, abi.Function.Definition>

export const StargateInfo = {
    getToken: {
        name: "getToken",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "tokenId", type: "uint256", internalType: "uint256" },
                    { name: "levelId", type: "uint8", internalType: "uint8" },
                    { name: "mintedAtBlock", type: "uint64", internalType: "uint64" },
                    { name: "vetAmountStaked", type: "uint256", internalType: "uint256" },
                    { name: "lastVthoClaimTimestamp", type: "uint48", internalType: "uint48" },
                ],
                internalType: "struct DataTypes.Token",
            },
        ],
        stateMutability: "view",
    },
    getTokenLevel: {
        name: "getTokenLevel",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
        stateMutability: "view",
    },
    canTransfer: {
        name: "canTransfer",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isUnderMaturityPeriod: {
        name: "isUnderMaturityPeriod",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isXToken: {
        name: "isXToken",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isNormalToken: {
        name: "isNormalToken",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    tokenExists: {
        name: "tokenExists",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    idsOwnedBy: {
        name: "idsOwnedBy",
        type: "function",
        inputs: [{ name: "_owner", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
        stateMutability: "view",
    },
    levelsOwnedBy: {
        name: "levelsOwnedBy",
        type: "function",
        inputs: [{ name: "_owner", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint8[]", internalType: "uint8[]" }],
        stateMutability: "view",
    },
    tokensOwnedBy: {
        name: "tokensOwnedBy",
        type: "function",
        inputs: [{ name: "_owner", type: "address", internalType: "address" }],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    { name: "tokenId", type: "uint256", internalType: "uint256" },
                    { name: "levelId", type: "uint8", internalType: "uint8" },
                    { name: "mintedAtBlock", type: "uint64", internalType: "uint64" },
                    { name: "vetAmountStaked", type: "uint256", internalType: "uint256" },
                    { name: "lastVthoClaimTimestamp", type: "uint48", internalType: "uint48" },
                ],
                internalType: "struct DataTypes.Token[]",
            },
        ],
        stateMutability: "view",
    },
    ownerTotalVetStaked: {
        name: "ownerTotalVetStaked",
        type: "function",
        inputs: [{ name: "_owner", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    normalTokensCount: {
        name: "normalTokensCount",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint208", internalType: "uint208" }],
        stateMutability: "view",
    },
    xTokensCount: {
        name: "xTokensCount",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint208", internalType: "uint208" }],
        stateMutability: "view",
    },
    getCurrentTokenId: {
        name: "getCurrentTokenId",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    maturityPeriodEndBlock: {
        name: "maturityPeriodEndBlock",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint64", internalType: "uint64" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateInfoKeys, abi.Function.Definition>

export const StargateContractState = {
    pause: { name: "pause", type: "function", inputs: [], outputs: [], stateMutability: "nonpayable" },
    unpause: { name: "unpause", type: "function", inputs: [], outputs: [], stateMutability: "nonpayable" },
    paused: {
        name: "paused",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    setBaseURI: {
        name: "setBaseURI",
        type: "function",
        inputs: [{ name: "_baseTokenURI", type: "string", internalType: "string" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    baseURI: {
        name: "baseURI",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    setLegacyNodes: {
        name: "setLegacyNodes",
        type: "function",
        inputs: [{ name: "_legacyNodes", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    legacyNodes: {
        name: "legacyNodes",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract ITokenAuction" }],
        stateMutability: "view",
    },
    setStargateDelegation: {
        name: "setStargateDelegation",
        type: "function",
        inputs: [{ name: "_stargateDelegation", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    stargateDelegation: {
        name: "stargateDelegation",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract IStargateDelegation" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateContractStateKeys, abi.Function.Definition>

export const StargateLifecycle = {
    initialize: {
        name: "initialize",
        type: "function",
        inputs: [
            {
                name: "_initParams",
                type: "tuple",
                components: [
                    { name: "tokenCollectionName", type: "string", internalType: "string" },
                    { name: "tokenCollectionSymbol", type: "string", internalType: "string" },
                    { name: "baseTokenURI", type: "string", internalType: "string" },
                    { name: "admin", type: "address", internalType: "address" },
                    { name: "upgrader", type: "address", internalType: "address" },
                    { name: "pauser", type: "address", internalType: "address" },
                    { name: "levelOperator", type: "address", internalType: "address" },
                    { name: "legacyNodes", type: "address", internalType: "address" },
                    { name: "stargateDelegation", type: "address", internalType: "address" },
                    { name: "vthoToken", type: "address", internalType: "address" },
                    { name: "legacyLastTokenId", type: "uint256", internalType: "uint256" },
                    {
                        name: "levelsAndSupplies",
                        type: "tuple[]",
                        components: [
                            {
                                name: "level",
                                type: "tuple",
                                components: [
                                    { name: "name", type: "string", internalType: "string" },
                                    { name: "isX", type: "bool", internalType: "bool" },
                                    { name: "id", type: "uint8", internalType: "uint8" },
                                    { name: "maturityBlocks", type: "uint64", internalType: "uint64" },
                                    { name: "scaledRewardFactor", type: "uint64", internalType: "uint64" },
                                    { name: "vetAmountRequiredToStake", type: "uint256", internalType: "uint256" },
                                ],
                                internalType: "struct DataTypes.Level",
                            },
                            { name: "circulatingSupply", type: "uint208", internalType: "uint208" },
                            { name: "cap", type: "uint32", internalType: "uint32" },
                        ],
                        internalType: "struct DataTypes.LevelAndSupply[]",
                    },
                ],
                internalType: "struct DataTypes.StargateNFTInitParams",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    upgradeToAndCall: {
        name: "upgradeToAndCall",
        type: "function",
        inputs: [
            { name: "newImplementation", type: "address", internalType: "address" },
            { name: "data", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    proxiableUUID: {
        name: "proxiableUUID",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
    },
    UPGRADE_INTERFACE_VERSION: {
        name: "UPGRADE_INTERFACE_VERSION",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateLifecycleKeys, abi.Function.Definition>

export const StargateUtility = {
    version: {
        name: "version",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
    },
    supportsInterface: {
        name: "supportsInterface",
        type: "function",
        inputs: [{ name: "_interfaceId", type: "bytes4", internalType: "bytes4" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    clock: {
        name: "clock",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint48", internalType: "uint48" }],
        stateMutability: "view",
    },
    CLOCK_MODE: {
        name: "CLOCK_MODE",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "pure",
    },
    REWARD_MULTIPLIER_SCALING_FACTOR: {
        name: "REWARD_MULTIPLIER_SCALING_FACTOR",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateUtilityKeys, abi.Function.Definition>
