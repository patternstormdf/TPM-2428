import {app} from "../src/app"
import * as HTTP from "node-fetch"
import invoke from "node-fetch"

test("synth the app", async(done) => {
    await app.synthetise("p2vtpm")
    done()
}, 1000000)

test("deploy the app", async(done) => {
    await app.deploy("p2vtpm")
    done()
}, 1000000)

test("undeploy the app", async(done) => {
    await app.undeploy("p2vtpm")
    done()
}, 1000000)


const url: string = "https://u33ykj6fp9.execute-api.us-east-1.amazonaws.com/prod/"

async function post(input: object): Promise<HTTP.Response> {

    return await invoke(url, {
        method: "post",
        body: JSON.stringify(input),
        headers: {"Content-Type": "application/json"}
    })
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
    const output: HTTP.Response = await post(input)
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
    const output: HTTP.Response = await post(input)
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
    const output: HTTP.Response = await post(input)
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
        "Message": "invalid timestamp"
    }
    const output: HTTP.Response = await post(input)
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
        "Message": "invalid timestamp"
    }
    const output: HTTP.Response = await post(input)
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
    const output: HTTP.Response = await post(input)
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
    const output: HTTP.Response = await post(input)
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
    const output: HTTP.Response = await post(input)
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
    const output: HTTP.Response = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("A", async(done) => {
    const date1: Date = new Date(Date.now() + 10000)
    const date2 : Date = new Date(date1.getTime() + (30*60*1000))
    const input = {
        "Schedule": [
            {
                "Timestamp": date1.toISOString()
            },
            {
                "Delay": 3600
            },
            {
                "Timestamp": date2.toISOString(),
                "Foo": "bar xyzzy"
            }
        ],
        "Topic": { "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1" },
        "Message": "A"
    }
    const output: HTTP.Response = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("B", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 1800
            },
            {
                "Timestamp": "2020-10-31T00:00:00Z"
            }
        ],
        "Topic": { "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic2" },
        "Message": "B"
    }
    const output: HTTP.Response = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)

test("C", async(done) => {
    const input = {
        "Schedule": [
            {
                "Delay": 60
            },
            {
                "Delay": -1
            }
        ],
        "Topic": { "ARN": "arn:aws:sns:us-east-1:162174280605:cpani-sf-badge-task-1-topic1" },
        "Message": "C"
    }

    const output: HTTP.Response = await post(input)
    console.log(JSON.stringify(output))
    done()
}, 5000)


