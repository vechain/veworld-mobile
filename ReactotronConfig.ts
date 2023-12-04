import Reactotron, { networking, overlay } from "reactotron-react-native"
import { reactotronRedux } from "reactotron-redux"

const reactotron = Reactotron.configure({ name: "VeWorld" })
    .use(reactotronRedux())
    .use(networking())
    .use(overlay())
    .useReactNative()
    .connect()

export default reactotron
