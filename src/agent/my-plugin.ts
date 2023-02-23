import { IAgentPlugin } from '@veramo/core'
import { IMyAgentPlugin, IMyAgentDidPeerArgs, IRequiredContext, IMyAgentDidPeerResult } from '../types/IMyAgentPlugin'
import { schema } from '../index'

/**
 * {@inheritDoc IMyAgentPlugin}
 * @beta
 */
export class MyAgentPlugin implements IAgentPlugin {
  readonly schema = schema.IMyAgentPlugin

  // map the methods your plugin is declaring to their implementation
  readonly methods: IMyAgentPlugin = {
    myDidPeer: this.myDidPeer.bind(this),
  }

  // list the event types that this plugin cares about.
  // When the agent emits an event of these types, `MyAgentPlugin.onEvent()` will get called.
  readonly eventTypes = ['validatedMessage']

  // the event handler for the types listed in `eventTypes`
  public async onEvent(event: { type: string; data: any }, context: IRequiredContext) {
    // you can emit other events
    await context.agent.emit('my-event', { num_algo: event.data.num_algo})
    // or call other agent methods that are declared in the context
    const allDIDs = await context.agent.didManagerFind()
  }

  /** {@inheritDoc IMyAgentPlugin.myDidPeer} */
  private async myDidPeer(args: IMyAgentDidPeerArgs, context: IRequiredContext): Promise<IMyAgentDidPeerResult> {
    // you can call other agent methods (that are declared in the `IRequiredContext`)
    const didDoc = await context.agent.createIdentifier({ didUrl: args.did })
    // or emit some events
    console.log(didDoc)
    await context.agent.emit('my-other-event', { num_algo: 0 })
    return { did: '' }
  }
}
