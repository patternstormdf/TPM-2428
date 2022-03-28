import {App as Application} from "../src/resources/App"
import * as AWS from "aws-sdk"


const sf: AWS.StepFunctions = new AWS.StepFunctions({region: Application.region})

type Output = AWS.StepFunctions.Types.StartExecutionOutput

async function post(input: object): Promise<Output> {
    const props: AWS.StepFunctions.Types.StartExecutionInput = {
        stateMachineArn: "arn:aws:states:us-east-1:162174280605:stateMachine:cpani-sf-badge-task-1-state-machine-orchestrator",
        input: JSON.stringify(input)
    }
    const output: AWS.StepFunctions.Types.StartExecutionOutput = await sf.startExecution(props).promise()
    return output
}

test("positive delay and a future timestamp", async(done) => {
    const date: Date = new Date(Date.now() + 10000)
    const input = {
        "Schedule": [
            {
                "Delay": 2
            },
            {
                "Timestamp": date.toISOString()
            }
        ],
        "Topic": {
            "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1"
        },
        "Message": "positive delay and a future timestamp"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("past timestamp", async(done) => {
    const input = {
        "Schedule": [
            {
                "Timestamp": "2021-02-02T00:00:00Z"
            }
        ],
        "Topic": {
            "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic2"
        },
        "Message": "past timestamp"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("invalid timestamp", async(done) => {
    const input = {
        "Schedule": [
            {
                "Timestamp": "2021-2T00:00:00Z"
            }
        ],
        "Topic": {
            "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1"
        },
        "Message": "invalid timestamp"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("zero delay", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 0
            }
        ],
        "Topic": {
            "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1"
        },
        "Message": "zero delay"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("negative delay", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": -5
            }
        ],
        "Topic": {
            "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1"
        },
        "Message": "negative delay"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("both delay and timespamp present", async(done) => {
    const input = {
        "Schedule": [
            {
                "Timestamp": "2020-10-31T00:00:00Z",
                "Delay": 10
            }
         ],
        "Topic": {
            "ARN": "arn:aws:sns:..."
        },
        "Message": "Message sent at each time given in the schedule"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("schedule is a string", async(done) => {
    const input = {
        "Schedule": "not an array",
        "Topic": {
            "ARN": "arn:aws:sns:..."
        },
        "Message": "Message sent at each time given in the schedule"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("schedule is an object", async(done) => {
    const input = {
        "Schedule": {},
        "Topic": {
            "ARN": "arn:aws:sns:..."
        },
        "Message": "Message sent at each time given in the schedule"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("no schedule", async(done) => {
    const input = {
        "Topic": {
            "ARN": "arn:aws:sns:..."
        },
        "Message": "Message sent at each time given in the schedule"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("no topic", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 10
            }
        ],
        "Message": "Message sent at each time given in the schedule"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("no message", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 10
            }
        ],
        "Topic": {
            "ARN": "arn:aws:sns:..."
        }
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("A", async(done) => {
    const date1: Date = new Date(Date.now() + 10000)
    const date2 : Date = new Date(date1.getTime() + (1*60*1000))
    const input = {
        "Schedule": [
            {
                "Timestamp": date1.toISOString()
            },
            {
                "Delay": 10
            },
            {
                "Timestamp": date2.toISOString(),
                "Foo": "bar xyzzy"
            }
        ],
        "Topic": { "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1" },
        "Message": "A"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("B", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 4
            },
            {
                "Timestamp": "2020-10-31T00:00:00Z"
            }
        ],
        "Topic": { "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic2" },
        "Message": "B"
    }
    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("C", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 2
            },
            {
                "Delay": -1
            }
        ],
        "Topic": { "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1" },
        "Message": "C"
    }

    const output: Output = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)


