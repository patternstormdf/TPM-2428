import {CloudWatch, IAM, StepFunction} from "@pstorm/aws-cdk"
import * as sfn from "aws-cdk-lib/aws-stepfunctions"
import {App} from "./App"
import {isDefined} from "@pstorm/aws-cdk/cdk/Utils"

export namespace Workflow {

    export namespace State {

        export namespace PassInput {
            export function id(app: App): string {
                return `${StateMachine.id(app)}-pass-input`
            }
        }

        export function passInput(app: App): StepFunction.State.Pass {
            let state: StepFunction.State.Pass | undefined =
                app.getResource(Map.id(app)) as StepFunction.State.Pass
            if (isDefined(state)) return state
            state = new StepFunction.State.Pass(
                PassInput.id(app),
                app.tags,
                {
                    parameters: {
                        "time.$": "$",
                        "topicArn.$": "$$.Execution.Input.Topic.ARN",
                        "message.$": "$$.Execution.Input.Message"
                    }}
                )
            state.next(Map.State.validateInput(app))
            app.addResource(state)
            return state
        }

        export namespace Map {
            export function id(app: App): string {
                return `${StateMachine.id(app)}-map`
            }

            export namespace State {

                export namespace Publish {
                    export function id(app: App): string {return `${Map.id(app)}-publish`}
                }

                export function publish(app: App): StepFunction.State.Custom {
                    let state: StepFunction.State.Custom | undefined = app.getResource(Publish.id(app)) as StepFunction.State.Custom
                    if (isDefined(state)) return state
                    state = new StepFunction.State.Custom(
                        Publish.id(app),
                        {
                            Type: "Task",
                            Resource: "arn:aws:states:::sns:publish",
                            Parameters: {
                                "TopicArn.$": "$.topicArn",
                                "Message.$": "States.Format('\\{\"message\": \"{}\", \"timestamp\": \"{}\" \\}',$.message, $$.State.EnteredTime)"
                            }
                        },
                        app.tags
                    )
                    app.addResource(state)
                    return state
                }

                export namespace Wait {

                    export namespace Delay {
                        export function id(app: App): string {
                            return `${Map.id(app)}-wait-delay`
                        }
                    }

                    export function delay(app: App): StepFunction.State.Wait {
                        let state: StepFunction.State.Wait | undefined = app.getResource(Delay.id(app)) as StepFunction.State.Wait
                        if (isDefined(state)) return state
                        state = new StepFunction.State.Wait({
                            id: Delay.id(app),
                            secondsJsonPath: sfn.JsonPath.stringAt("$.time.Delay"),
                            tags: app.tags
                        })
                        state.next(State.publish(app))
                        app.addResource(state)
                        return state
                    }

                    export namespace Timestamp {
                        export function id(app: App): string {
                            return `${Map.id(app)}-wait-timestamp`
                        }
                    }

                    export function timestamp(app: App): StepFunction.State.Wait {
                        let state: StepFunction.State.Wait | undefined = app.getResource(Timestamp.id(app)) as StepFunction.State.Wait
                        if (isDefined(state)) return state
                        state = new StepFunction.State.Wait({
                            id: Timestamp.id(app),
                            timestampJsonPath: sfn.JsonPath.stringAt("$.time.Timestamp"),
                            tags: app.tags
                        })
                        state.next(State.publish(app))
                        app.addResource(state)
                        return state
                    }
                }

                export namespace Error {
                    export function id(app: App): string {return `${Map.id(app)}-error`}
                }

                export function error(app: App): StepFunction.State.Fail {
                    let state: StepFunction.State.Fail | undefined = app.getResource(Error.id(app)) as StepFunction.State.Fail
                    if (isDefined(state)) return state
                    state = new StepFunction.State.Fail(Error.id(app), "400", "Must specify either 'Delay' or 'Timestamp'", app.tags)
                    app.addResource(state)
                    return state
                }

                export namespace ValidateInput {
                    export function id(app: App): string {return `${Map.id(app)}-validate-input`}
                }

                export function validateInput(app: App): StepFunction.State.Choice {
                    let state: StepFunction.State.Choice | undefined =
                        app.getResource(ValidateInput.id(app)) as StepFunction.State.Choice
                    if (isDefined(state)) return state
                    state = new StepFunction.State.Choice(ValidateInput.id(app), app.tags)
                    state.when(sfn.Condition.and(
                        sfn.Condition.isPresent("$.time.Delay"),
                        sfn.Condition.isPresent("$.time.Timestamp")
                    ), State.error(app))
                    state.when(sfn.Condition.and(
                        sfn.Condition.isPresent("$.time.Delay"),
                        sfn.Condition.isNumeric("$.time.Delay"),
                        sfn.Condition.numberGreaterThan("$.time.Delay", 0)
                    ), State.Wait.delay(app))
                    state.when(sfn.Condition.and(
                        sfn.Condition.isPresent("$.time.Delay"),
                        sfn.Condition.isNumeric("$.time.Delay"),
                        sfn.Condition.numberEquals("$.time.Delay", 0)
                    ), State.publish(app))
                    state.when(sfn.Condition.and(
                        sfn.Condition.isPresent("$.time.Delay"),
                        sfn.Condition.isNumeric("$.time.Delay"),
                        sfn.Condition.numberLessThan("$.time.Delay", 0)
                    ), State.error(app))
                    state.when(sfn.Condition.and(
                        sfn.Condition.isPresent("$.time.Timestamp"),
                        sfn.Condition.isTimestamp("$.time.Timestamp"),
                        sfn.Condition.timestampGreaterThanEqualsJsonPath("$.time.Timestamp", "$$.State.EnteredTime")
                    ), State.Wait.timestamp(app))
                    state.when(sfn.Condition.and(
                        sfn.Condition.isPresent("$.time.Timestamp"),
                        sfn.Condition.isTimestamp("$.time.Timestamp"),
                        sfn.Condition.timestampLessThanJsonPath("$.time.Timestamp", "$$.State.EnteredTime")
                    ), State.publish(app))
                    state.otherwise(State.error(app))
                    app.addResource(state)
                    return state
                }
            }
        }

        export function map(app: App): StepFunction.State.Map {
            let state: StepFunction.State.Map | undefined =
                app.getResource(Map.id(app)) as StepFunction.State.Map
            if (isDefined(state)) return state
            state = new StepFunction.State.Map(
                Map.id(app),
                sfn.JsonPath.stringAt("$.Schedule"),
                1,
                app.tags)
            state.next(State.passInput(app))
            state.onError(State.error(app))
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
                sfn.Condition.isPresent("$.Schedule"),
                sfn.Condition.isPresent("$.Topic.ARN"),
                sfn.Condition.isString("$.Topic.ARN"),
                sfn.Condition.isPresent("$.Message"),
                sfn.Condition.isString("$.Message")
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

        export function permissions(app: App): IAM.Permissions {
            return new IAM.Permissions(
                ["sns:Publish"],
                "Allow",
                [],
                ["*"]
            )
        }
    }

    export function stateMachine(app: App): StepFunction.StateMachine {
        let stateMachine: StepFunction.StateMachine | undefined =
            app.getResource(StateMachine.id(app)) as StepFunction.StateMachine
        if (isDefined(stateMachine)) return stateMachine
        stateMachine = new StepFunction.StateMachine(StateMachine.id(app),
            sfn.StateMachineType.STANDARD, State.validateInput(app), app.tags, logGroup(app),
            StateMachine.permissions(app))
        return stateMachine
    }
}
