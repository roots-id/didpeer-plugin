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
          num_algo: 2,
          service : {
            id:'did:peer:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX',
            type:'didcomm/v2',
            serviceEndpoint:[{uri:'https://example.com/endpoint'}]
          }
        }
      })
      console.log('AAAAAAAAA,',result)
      expect(result.provider).toEqual('did:peer')
    })

    it('should num algo', async () => {
      const result = await agent.didManagerCreate({
        provider: 'did:peer',
        options: {
          num_algo: 0
        }
      })
      console.log('AAAAAAAAA,',result)
      expect(result.provider).toEqual('did:peer')
    })

    it('resolve did peer 2', async () => {
      const result = await agent.resolveDid({did:'did:peer:0z6MkfCk5N4MmA9zb48dGxMWjqeuG7T8t6nkiwYDNep8VehKx'})
      console.log('BBBBBBBBB,',result)
      expect(result).toEqual('did:peer')
    }
    )
  })
}
