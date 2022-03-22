import {Application} from "@pstorm/aws-cdk"


export class App {
    id: string = "cpani-sf-badge-task-1"

    private _application: Application = Application.new(`${this.id}-app`,
        "162174280605", "us-east-1", "src/app.ts")

    tags: Application.Resource.Tag[] = [
        {key: "owner", value: "claudi.paniagua@devfactory.com"},
        {key: "purpose", value: "https://devgraph-alp.atlassian.net/browse/TPM-2428"}
    ]

    addResource(resource: Application.Resource): void {
        this._application.addResource(resource)
    }

    getResource(resourceId: string): Application.Resource | undefined {
        return this._application.getResource(resourceId)
    }

    async deploy(profile: string): Promise<void> {
        await this._application.deploy(profile)
    }

    async synthetise(profile: string): Promise<void> {
        await this._application.synthetise(profile)
    }

    async undeploy(profile: string): Promise<void> {
        await this._application.undeploy(profile)
    }
}


