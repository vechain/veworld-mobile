export function successfulExecuteStub(): Promise<Connex.VM.Output[]> {
    return Promise.resolve([
        {
            data: "data",
            vmError: "",
            gasUsed: 1,
            reverted: false,
            revertReason: "",
            events: [],
            transfers: [],
        },
    ])
}
