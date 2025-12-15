export type ScanFunctionRegistry = {
    vns: (
        data: string,
        defaultFn: (data: string) => Promise<{ address: string; name: string } | undefined>,
    ) => Promise<boolean>
    address: (data: string, defaultFn: (data: string) => void) => Promise<boolean>
    walletConnect: (data: string, defaultFn: (data: string) => void) => Promise<boolean>
    url: (data: string, defaultFn: (data: string) => Promise<void>) => Promise<boolean>
}
