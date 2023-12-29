/**
 * The derivation path for VeChain accounts on the ledger device
 */
export const VET_DERIVATION_PATH = "m/44'/818'/0'/0"

/**
 * Ledger error codes mapped from the device to a more readable format
 */
export enum LEDGER_ERROR_CODES {
    OFF_OR_LOCKED = "off_or_locked",
    NO_VET_APP = "no_vet_app",
    UNKNOWN = "unknown",
    WRONG_ROOT_ACCOUNT = "wrong_root_account",
    CONNECTING = "connecting",
    WAITING_SIGNATURE = "waiting_signature",
    CONTRACT_AND_CLAUSES_DISABLED = "contracts_and_clauses_disabled",
    CONTRACT_DISABLED = "contract_disabled",
    CLAUSES_DISABLED = "clauses_disabled",
    USER_REJECTED = "user_rejected",
    DEVICE_NOT_FOUND = "device_not_found",
}

export enum StatusCodes {
    PIN_REMAINING_ATTEMPTS = 0x63c0,
    INCORRECT_LENGTH = 0x6700,
    COMMAND_INCOMPATIBLE_FILE_STRUCTURE = 0x6981,
    SECURITY_STATUS_NOT_SATISFIED = 0x6982,
    CONDITIONS_OF_USE_NOT_SATISFIED = 0x6985,
    INCORRECT_DATA = 0x6a80,
    NOT_ENOUGH_MEMORY_SPACE = 0x6a84,
    REFERENCED_DATA_NOT_FOUND = 0x6a88,
    FILE_ALREADY_EXISTS = 0x6a89,
    INCORRECT_P1_P2 = 0x6b00,
    INS_NOT_SUPPORTED = 0x6d00,
    CLA_NOT_SUPPORTED = 0x6e00,
    TECHNICAL_PROBLEM = 0x6f00,
    OK = 0x9000,
    MEMORY_PROBLEM = 0x9240,
    NO_EF_SELECTED = 0x9400,
    INVALID_OFFSET = 0x9402,
    FILE_NOT_FOUND = 0x9404,
    INCONSISTENT_FILE = 0x9408,
    ALGORITHM_NOT_SUPPORTED = 0x9484,
    INVALID_KCV = 0x9485,
    CODE_NOT_INITIALIZED = 0x9802,
    ACCESS_CONDITION_NOT_FULFILLED = 0x9804,
    CONTRADICTION_SECRET_CODE_STATUS = 0x9808,
    CONTRADICTION_INVALIDATION = 0x9810,
    CODE_BLOCKED = 0x9840,
    MAX_VALUE_REACHED = 0x9850,
    GP_AUTH_FAILED = 0x6300,
    LICENSING = 0x6f42,
    HALTED = 0x6faa,
}
