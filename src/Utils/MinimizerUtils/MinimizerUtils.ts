import { NativeModules } from "react-native"

const { Minimizer } = NativeModules

interface IMinimizer {
    goBack(): void
}

export default Minimizer as IMinimizer
