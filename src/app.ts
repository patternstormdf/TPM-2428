import {App} from "./resources/App"
import {topic1, topic2} from "./resources/Topics"
import {Workflow} from "./resources/Workflow"


export const app: App = new App()
app.addResource(topic1(app))
app.addResource(topic2(app))
app.addResource(Workflow.stateMachine(app))
