import { TAgent, IMessageHandler } from '@veramo/core'
import { IMyAgentPlugin } from '../../src/types/IMyAgentPlugin'

type ConfiguredAgent = TAgent<IMyAgentPlugin & IMessageHandler>

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
      const result = await agent.myDidPeer({
        num_algo: 0
      })
      expect(result).toEqual({ did: 'ipsum' })
    })
  })
}
