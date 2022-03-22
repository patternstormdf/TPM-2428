import {CloudWatch, StepFunction} from "@pstorm/aws-cdk"
import {Notifier} from "./Notifier"
import * as sfn from "aws-cdk-lib/aws-stepfunctions"
import {App} from "../App"
import {isDefined} from "@pstorm/aws-cdk/cdk/Utils"

export namespace Orchestrator {


    export namespace State {

        export namespace Notify {
            export function id(app: App): string {
                return `${StateMachine.id(app)}-notify`
            }
        }

        export function notify(app: App): StepFunction.State.Task.StepFunctionInvoke {
            let state: StepFunction.State.Task.StepFunctionInvoke | undefined =
                app.getResource(Notify.id(app)) as StepFunction.State.Task.StepFunctionInvoke
            if (isDefined(state)) return state
            state = new StepFunction.State.Task.StepFunctionInvoke(
                Notify.id(app),
                Notifier.stateMachine(app),
                {
                    "time.$": "$",
                    "topicArn.$": "$$.Execution.Input.body.Topic.ARN",
                    "message.$": "States.Format('\\{\"message\": \"{}\", \"timestamp\": \"{}\" \\}',$$.Execution.Input.body.Message, $$.State.EnteredTime)"
                },
                app.tags)
            app.addResource(state)
            return state
        }

        export namespace Map {
            export function id(app: App): string {
                return `${StateMachine.id(app)}-map`
            }
        }

        export function map(app: App): StepFunction.State.Map {
            let state: StepFunction.State.Map | undefined =
                app.getResource(Map.id(app)) as StepFunction.State.Map
            if (isDefined(state)) return state
            state = new StepFunction.State.Map(
                Map.id(app),
                sfn.JsonPath.stringAt("$.body.Schedule"),
                10,
                app.tags)
            state.next(State.notify(app))
            app.addResource(state)
            return state
        }

        export namespace Error {
            export function id(app: App): string {return `${StateMachine.id(app)}-error`}
        }

        export function error(app: App): StepFunction.State.Fail {
            const message: string = `the request must have the following format
                {
                  "Schedule": [
                    {
                      "Timestamp"?: "<YYYY>-<MM>-<DD>T<hh>:<mm>:<ss><Z>",
                      "Delay"?: <seconds>
                    }
                  ],
                  "Topic": {
                    "ARN": "<topic ARN to which to send the message>"
                  },
                  "Message": "<Message sent at each time given in the schedule>"
                }`
            let state: StepFunction.State.Fail | undefined = app.getResource(Error.id(app)) as StepFunction.State.Fail
            if (isDefined(state)) return state
            state = new StepFunction.State.Fail(Error.id(app), "400", message, app.tags)
            app.addResource(state)
            return state
        }

        export namespace ValidateInput {
            export function id(app: App): string {return `${StateMachine.id(app)}-validate-input`}
        }

        export function validateInput(app: App): StepFunction.State.Choice {
            let state: StepFunction.State.Choice | undefined = app.getResource(ValidateInput.id(app)) as StepFunction.State.Choice
            if (isDefined(state)) return state
            state = new StepFunction.State.Choice(ValidateInput.id(app), app.tags)
            state.when(sfn.Condition.and(
                sfn.Condition.isPresent("$.body.Schedule"),
                sfn.Condition.isPresent("$.body.Topic.ARN"),
                sfn.Condition.isString("$.body.Topic.ARN"),
                sfn.Condition.isPresent("$.body.Message"),
                sfn.Condition.isString("$.body.Message")
            ), State.map(app))
            state.otherwise(State.error(app))
            app.addResource(state)
            return state
        }
    }

    export namespace LogGroup {
        export function id(app: App): string {
            return `/aws/vendedlogs/states/${StateMachine.id(app)}`
        }
    }

    export function logGroup(app: App): CloudWatch.LogGroup {
        let logGroup: CloudWatch.LogGroup | undefined = app.getResource(LogGroup.id(app)) as CloudWatch.LogGroup
        if (isDefined(logGroup)) return logGroup
        logGroup = CloudWatch.LogGroup.new(LogGroup.id(app), app.tags)
        app.addResource(logGroup)
        return logGroup
    }

    export namespace StateMachine {
        export function id(app: App): string {
            return `${app.id}-state-machine-orchestrator`
        }
    }

    export function stateMachine(app: App): StepFunction.StateMachine {
        let stateMachine: StepFunction.StateMachine | undefined =
            app.getResource(StateMachine.id(app)) as StepFunction.StateMachine
        if (isDefined(stateMachine)) return stateMachine
        stateMachine = new StepFunction.StateMachine(StateMachine.id(app),
            sfn.StateMachineType.EXPRESS, State.validateInput(app), app.tags, logGroup(app))
        app.addResource(stateMachine)
        return stateMachine
    }
}
