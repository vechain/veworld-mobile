import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { VETLedgerApp } from "~Constants"
import { error } from "~Utils"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"

/**
 * @param app - the VET app on the ledger
 * @param reloadConfigTimeout - the timeout in ms to reload the ledger config
 * @param blockAutoReloadWhenReady - if true, the config will not be reloaded when the user has enabled clauses and contracts
 */
type Props = {
    app?: VETLedgerApp
    reloadConfigTimeout?: number
    blockAutoReloadWhenReady?: boolean
    onGetLedgerConfigError?: (e: any) => void
}

/**
 * This hook is used to get the configuration of the VET app on the ledger and determine if the user has enabled clauses/ contracts
 */
export const useLegderConfig = ({
    app,
    reloadConfigTimeout = 3000,
    blockAutoReloadWhenReady = true,
    onGetLedgerConfigError,
}: Props): UseLedgerConfigProps => {
    // used to determine if the user has enabled clauses/ contracts
    const [config, setConfig] = useState<string>()
    const clausesEnabled = useMemo(() => {
        if (config === LedgerConfig.CLAUSE_AND_CONTRACT_DISABLED) return false
        if (config === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED) return true
        return config === LedgerConfig.CLAUSE_ONLY_ENABLED
    }, [config])
    const contractEnabled = useMemo(() => {
        if (config === LedgerConfig.CLAUSE_AND_CONTRACT_DISABLED) return false
        if (config === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED) return true
        return config === LedgerConfig.CONTRACT_ONLY_ENABLED
    }, [config])

    const timer = useRef<NodeJS.Timeout | undefined>(undefined)

    const clausesAndContractEnabled = useMemo(
        () => clausesEnabled && contractEnabled,
        [clausesEnabled, contractEnabled],
    )

    const getLedgerConfig = useCallback(async () => {
        try {
            if (app) {
                const appConfig = await app.getAppConfiguration()
                const appConfigHex = appConfig.toString("hex")
                setConfig(appConfigHex)
                return appConfigHex
            }
        } catch (e) {
            error("[Ledger] - Error getting ledger config", e)
            onGetLedgerConfigError?.(e)
        }
    }, [app, onGetLedgerConfigError])

    useEffect(() => {
        timer.current = setInterval(async () => {
            if (blockAutoReloadWhenReady && clausesAndContractEnabled) return
            await getLedgerConfig()
        }, reloadConfigTimeout)

        return () => {
            if (timer.current) clearInterval(timer.current)
        }
    }, [
        timer,
        reloadConfigTimeout,
        getLedgerConfig,
        blockAutoReloadWhenReady,
        clausesAndContractEnabled,
    ])

    return {
        config,
        clausesEnabled,
        contractEnabled,
        getLedgerConfig,
    }
}

/**
 * @field config - the configuration of the VET app on the ledger
 * @field clausesEnabled - a boolean that indicates if the user has enabled clauses
 * @field contractEnabled - a boolean that indicates if the user has enabled contracts
 * @field getLedgerConfig - a function that can be used to manually get the ledger config
 */
interface UseLedgerConfigProps {
    config?: string
    clausesEnabled: boolean
    contractEnabled: boolean
    getLedgerConfig: () => Promise<string | undefined>
}
