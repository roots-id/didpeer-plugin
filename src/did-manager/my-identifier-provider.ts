import { IIdentifier, IKey, IService, IAgentContext, IKeyManager, DIDDocument } from '@veramo/core'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import Multibase from 'multibase'
import Multicodec from 'multicodec'
import Debug from 'debug'
import * as u8a from 'uint8arrays'

type IContext = IAgentContext<IKeyManager>

/**
 * You can use this template for an `AbstractIdentifierProvider` implementation.
 *
 * Implementations of this interface are used by `@veramo/did-manager` to implement
 * CRUD operations for various DID methods.
 *
 * If you wish to implement support for a particular DID method, this is the type of class
 * you need to implement.
 *
 * If you don't want to customize this, then it is safe to remove from the template.
 *
 * @alpha
 */


const debug = Debug('veramo:peer-did:identifier-provider')

type Options = {
  defaultKms: string,
  num_algo: number,
  service?: IService
}

/**
 * `peer-did` Identifier Provider for Veramo
 * https://github.com/sicpa-dlab/peer-did-jvm/blob/main/lib/src/main/kotlin/org/didcommx/peerdid/core/PeerDIDHelper.kt#L35
 */

const ServiceReplacements = {
  'type': 't',
  'DIDCommMessaging': 'dm',
  'serviceEndpoint': 's',
  'routingKeys': 'r',
  'accept': 'a'
}

const encodeService = (service: IService): string => {
  let encoded = JSON.stringify(service)
  Object.values(ServiceReplacements).forEach((v: string, idx: number) => {
      encoded = encoded.replace(Object.keys(ServiceReplacements)[idx], v)
  })
  return u8a.toString(u8a.fromString(encoded, 'utf-8'), 'base64url')
}
export class PeerDIDProvider extends AbstractIdentifierProvider {
  private options: Options

  constructor(options: Options) {
    super()
    this.options = options
  }
  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {

    if (options.num_algo == 0) {
      const key = await context.agent.keyManagerCreate({ kms: kms || this.options.defaultKms, type: 'Ed25519' })
      const methodSpecificId = Buffer.from(
        Multibase.encode(
          'base58btc',
          Multicodec.addPrefix('ed25519-pub', Buffer.from(key.publicKeyHex, 'hex')),
        ),
      ).toString()

      const identifier: Omit<IIdentifier, 'provider'> = {
        did: 'did:peer:0' + methodSpecificId,
        controllerKeyId: key.kid,
        keys: [key],
        services: [],
      }
      debug('Created', identifier.did)
      return identifier
    }

    else if (options.num_algo == 1) {
      throw new Error( `'PeerDIDProvider num algo ${options.num_algo} not supported yet.'`)

    }
    else if (options.num_algo == 2) {
      const authKey = await context.agent.keyManagerCreate({ kms: kms || this.options.defaultKms, type: 'Ed25519' })

      const agreementKey = await context.agent.keyManagerCreate({ kms: kms || this.options.defaultKms, type: 'X25519' })

      const authKeyText = Buffer.from(
        Multibase.encode(
          'base58btc',
          Multicodec.addPrefix('ed25519-pub', Buffer.from(authKey.publicKeyHex, 'hex')),
        ),
      ).toString()

      const agreementKeyText = Buffer.from(
        Multibase.encode(
          'base58btc',
          Multicodec.addPrefix('x25519-pub', Buffer.from(agreementKey.publicKeyHex, 'hex')),
        ),
      ).toString()

      const ServiceEncoded = encodeService(options.service)


      const identifier: Omit<IIdentifier, 'provider'> = {
        did: `did:peer:2.E${agreementKeyText}.V${authKeyText}.S${ServiceEncoded}`,
        controllerKeyId: authKey.kid,
        keys: [authKey,agreementKey],
        services: [options.service],
      }
      debug('Created', identifier.did)
      return identifier
    }
    else { 
      throw new Error( `'PeerDIDProvider num algo ${options.num_algo} not supported yet.'`)

    }
  }

  async updateIdentifier(): Promise<IIdentifier> {
    throw new Error('PeerDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(identifier: IIdentifier): Promise<boolean> {
    return true
  }

  async addKey(): Promise<void> {
    throw new Error('PeerDIDProvider addKey not supported.')
  }

  async addService(): Promise<void> {
    throw new Error('PeerDIDProvider addService not supported.')
  }

  async removeKey(): Promise<void> {
    throw new Error('PeerDIDProvider removeKey not supported.')
  }

  async removeService(): Promise<void> {
    throw new Error('PeerDIDProvider removeService not supported.')
  }
}
