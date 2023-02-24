import { TAgent, IMessageHandler, IDIDManager } from '@veramo/core'
import { IMyAgentPlugin } from '../../src/types/IMyAgentPlugin'

type ConfiguredAgent = TAgent<IMyAgentPlugin & IMessageHandler & IDIDManager>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('my plugin', () => {
    let agent: ConfiguredAgent

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should num algo', async () => {
      const result = await agent.didManagerCreate({
        provider: 'did:peer',
        options: {
          num_algo: 0
        }
      })
      expect(result.provider).toEqual('did:peer')
    })
  })
}
