/**
 * @public
 */
const schema = require('../plugin.schema.json')
export { schema }
export { MyAgentPlugin } from './agent/my-plugin'
export { PeerDidProvider } from './did-manager/my-identifier-provider'
export * from './types/IMyAgentPlugin'
