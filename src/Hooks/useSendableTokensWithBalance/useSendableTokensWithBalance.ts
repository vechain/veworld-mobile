import { useMemo } from "react"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

export const useSendableTokensWithBalance = () => {
    const { data: nonVechainTokens } = useNonVechainTokensBalance()
    const { data: vetBalance } = useTokenBalance({ tokenAddress: VET.address })
    const { data: vthoBalance } = useTokenBalance({ tokenAddress: VTHO.address })
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)
    const { data: b3trBalance } = useTokenBalance({ tokenAddress: B3TR.address })
    const { data: vot3Balance } = useTokenBalance({ tokenAddress: VOT3.address })

    const vetWithBalance = useMemo(() => {
        if (!vetBalance) return
        return { ...VET, balance: vetBalance }
    }, [vetBalance])

    const vthoWithBalance = useMemo(() => {
        if (!vthoBalance) return
        return { ...VTHO, balance: vthoBalance }
    }, [vthoBalance])

    const b3trWithBalance = useMemo(() => {
        if (!b3trBalance) return
        return { ...B3TR, balance: b3trBalance }
    }, [B3TR, b3trBalance])

    const vot3WithBalance = useMemo(() => {
        if (!vot3Balance) return
        return { ...VOT3, balance: vot3Balance }
    }, [VOT3, vot3Balance])

    return useMemo(
        () =>
            [vetWithBalance, vthoWithBalance, b3trWithBalance, vot3WithBalance, ...nonVechainTokens].filter(
                (tk): tk is NonNullable<typeof tk> => {
                    if (tk === undefined) return false
                    return !BigNutils(tk.balance.balance).isZero
                },
            ),
        [b3trWithBalance, nonVechainTokens, vetWithBalance, vot3WithBalance, vthoWithBalance],
    )
}
