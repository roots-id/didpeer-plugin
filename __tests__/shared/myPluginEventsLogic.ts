import { TAgent, IMessageHandler, IDIDManager, ICredentialPlugin } from '@veramo/core'
import { IMyAgentPlugin } from '../../src/types/IMyAgentPlugin'

type ConfiguredAgent = TAgent<IMyAgentPlugin & IMessageHandler & IDIDManager & ICredentialPlugin>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('my plugin events', () => {
    let agent: ConfiguredAgent

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it.skip('should emit my-event', async () => {
      expect.assertions(1)

      const myId = await agent.didManagerGetOrCreate({ alias: "test" })
      const myCredential = await agent.createVerifiableCredential({
        credential: { issuer: myId.did, credentialSubject: { hello: 'world' } },
        proofFormat: 'jwt'
      })

      const handler = jest.fn()
      // @ts-ignore
      agent.eventBus.on('my-event', handler)
      // The agent has the MyAgentPlugin installed. This plugin has an event handler that listens to `validatedMessage`
      // and then emits another event with the type `my-event`.
      const parsedMessage = await agent.handleMessage({
        raw: myCredential.proof.jwt,
        save: false,
        metaData: [{ type: 'test' }],
      })

      expect(handler).toBeCalledWith({
        foo: expect.any(String),
      })
    })
  })
}
