import {SNS} from "@pstorm/aws-cdk"
import {App} from "./App"
import {isDefined} from "@pstorm/aws-cdk/cdk/Utils"

export namespace Topic1 {
    export function id(app: App): string { return `${app.id}-topic1` }
}

export function topic1(app: App): SNS.Topic {
    let topic: SNS.Topic | undefined = app.getResource(Topic1.id(app)) as SNS.Topic
    if (isDefined(topic)) return topic
    topic = new SNS.Topic(Topic1.id(app), app.tags)
    return topic
}

export namespace Topic2 {
    export function id(app: App): string { return `${app.id}-topic2` }
}

export function topic2(app: App): SNS.Topic {
    let topic: SNS.Topic | undefined = app.getResource(Topic2.id(app)) as SNS.Topic
    if (isDefined(topic)) return topic
    topic = new SNS.Topic(Topic2.id(app), app.tags)
    return topic
}
