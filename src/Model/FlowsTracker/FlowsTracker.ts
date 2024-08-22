import { IMPORT_TYPE } from "../Wallet"

export type WalletGenerationData = {
    type: "create" | "import"
    importType?: IMPORT_TYPE
}
