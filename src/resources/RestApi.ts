import {ApiGateway} from "@pstorm/aws-cdk"
import {App} from "./App"
import {Orchestrator} from "./stepfunctions/Orchestrator"

export function restApi(app: App): ApiGateway.API.REST.StepFunction {
    return ApiGateway.API.REST.StepFunction.new(
        `${app.id}-api`,
        Orchestrator.stateMachine(app),
        app.tags)
}
