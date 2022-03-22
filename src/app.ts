import {App} from "./resources/App"
import {restApi} from "./resources/RestApi"
import {topic1, topic2} from "./resources/Topics"


export const app: App = new App()
app.addResource(topic1(app))
app.addResource(topic2(app))
app.addResource(restApi(app))
