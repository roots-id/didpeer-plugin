import Multibase from 'multibase'
import { IService, DIDDocument } from '@veramo/core'
import * as u8a from 'uint8arrays'

import { DIDResolutionOptions, DIDResolutionResult, DIDResolver, ParsedDID, Resolvable } from 'did-resolver'

const ServiceReplacements = {
    'type': 't',
    'DIDCommMessaging': 'dm',
    'serviceEndpoint': 's',
    'routingKeys': 'r',
    'accept': 'a'
}

const decodeService = (encoded: string): IService => {
    // Step 1: Decode base64url to JSON string
    const decoded = u8a.toString(u8a.fromString(encoded, 'base64url'), 'utf-8')

    // Step 2: Restore original key names
    const reversedReplacements: {[key: string]: string} = {}
    for (const [key, value] of Object.entries(ServiceReplacements)) {
      reversedReplacements[value] = key
    }

    let restored = decoded
    Object.values(reversedReplacements).forEach((v: string, idx: number) => {
        restored = restored.replace(Object.keys(reversedReplacements)[idx], v)
    })

    // Step 3: Parse JSON string to IService object
    return JSON.parse(restored)
}
const resolveDidKey: DIDResolver = async (
    didUrl: string,
    _parsed: ParsedDID,
    _resolver: Resolvable,
    options: DIDResolutionOptions,
): Promise<DIDResolutionResult> => {
    try {
        const startsWith = didUrl.substring(0, 10)
        if (startsWith == 'did:peer:0') {

            return {
                didDocumentMetadata: {},
                didResolutionMetadata: {},
                didDocument: {
                    id: didUrl,
                    "@context": "https://www.w3.org/ns/did/v1",
                    keyAgreement: [
                        {
                            id: didUrl + '#key-1',
                            type: 'X25519KeyAgreementKey2020',
                            controller: didUrl,
                            publicKeyMultibase: didUrl.split('.')[1]

                        }]

                }
            }

            } else if (startsWith == 'did:peer:1') {
                return {
                    didDocumentMetadata: {},
                    didResolutionMetadata: { error: 'invalidDid', message: 'unsupported num algo 1 for did:peer, only 0,2 are allowed ' },
                    didDocument: null,
                }
            } else if (startsWith == 'did:peer:2') {
                return {
                    didDocumentMetadata: {},
                    didResolutionMetadata: {},
                    didDocument: {
                        id: didUrl,
                        "@context": "https://www.w3.org/ns/did/v1",
                        authentication: [{   
                            id: didUrl + '#'+ didUrl.split('.')[2].substring(2),//remove the V S or E in addition to the z prefix
                            type: 'X25519KeyAgreementKey2020',
                            controller: didUrl,
                            publicKeyMultibase: didUrl.split('.')[2].substring(1)//remove the V S or E
                        }],

                        keyAgreement: [
                            {   
                                id: didUrl + '#'+ didUrl.split('.')[1].substring(2),//remove the V S or E in addition to the z prefix
                                type: 'X25519KeyAgreementKey2020',
                                controller: didUrl,
                                publicKeyMultibase: didUrl.split('.')[1].substring(1)//remove the V S or E
                            }],
                        service :[decodeService(didUrl.split('.')[3])]
    
                    }
                }
            } else {
                return {
                    didDocumentMetadata: {},
                    didResolutionMetadata: { error: 'invalidDid', message: 'unsupported num algo for did:peer, only 0,2 are allowed' },
                    didDocument: null,
                }
            }
        } catch (err: any) {
            return {
                didDocumentMetadata: {},
                didResolutionMetadata: { error: 'invalidDid', message: err.toString() },
                didDocument: null,
            }
        }
    }

/**
 * Provides a mapping to a did:key resolver, usable by {@link did-resolver#Resolver}.
 *
 * @public
 */
export function getDidKeyResolver() {
        return { key: resolveDidKey }
    }
