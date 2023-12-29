import { useCallback, useState } from "react"
import { LEDGER_ERROR_CODES } from "~Constants"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"

export const useLedgerAppConfig = ({ setErrorCode }: { setErrorCode: (s: LEDGER_ERROR_CODES | undefined) => void }) => {
    const [appConfig, _setAppConfig] = useState<LedgerConfig>(LedgerConfig.UNKNOWN)

    const setAppConfig = useCallback(
        (config: LedgerConfig) => {
            _setAppConfig(config)
            switch (config) {
                case LedgerConfig.CLAUSE_AND_CONTRACT_DISABLED:
                    setErrorCode(LEDGER_ERROR_CODES.CONTRACT_AND_CLAUSES_DISABLED)
                    break
                case LedgerConfig.CLAUSE_ONLY_ENABLED:
                    setErrorCode(LEDGER_ERROR_CODES.CONTRACT_DISABLED)
                    break
                case LedgerConfig.CONTRACT_ONLY_ENABLED:
                    setErrorCode(LEDGER_ERROR_CODES.CLAUSES_DISABLED)
                    break
                default:
                    setErrorCode(undefined)
            }
        },
        [setErrorCode],
    )

    return {
        appConfig,
        setAppConfig,
    }
}
