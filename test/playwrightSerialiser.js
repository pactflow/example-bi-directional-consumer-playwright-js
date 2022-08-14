import * as fs from 'fs'
import * as path from 'path'
import { omit } from 'lodash'

const AUTOGEN_HEADER_BLOCKLIST = [
  'access-control-expose-headers',
  'access-control-allow-credentials',
  'vary',
  'host',
  'proxy-connection',
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'user-agent',
  'sec-ch-ua-platform',
  'origin',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-dest',
  'referer',
  'accept-encoding',
  'accept-language',
  'date',
  'x-powered-by'
]

const removeDuplicates = (pact) => {
  let descriptions = {}

  pact.interactions = pact.interactions.reduce((acc, interaction) => {
    if (!descriptions[interaction.description]) acc.push(interaction)
    descriptions[interaction.description] = true

    return acc
  }, [])

  return pact
}

const writePact = (pact, filePath, keepDupeDescs) => {
  createPactDir()
  const cleanPact = removeDuplicates(pact)

  fs.writeFileSync(filePath, JSON.stringify(keepDupeDescs ? cleanPact : pact))
}

const createPactDir = () => {
  try {
    fs.mkdirSync('./pacts')
  } catch (e) {
    // likely dir already exists
  }
}

const readPactFileOrDefault = (filePath, defaultPact) => {
  let pact = {}

  try {
    const res = fs.readFileSync(filePath)
    pact = JSON.parse(res.toString('utf8'))
  } catch (e) {
    pact = defaultPact
  }

  return pact
}

export const transformPlaywrightMatchToPact = async (route, opts) => {
  const { pacticipant, provider, keepDupeDescs } = opts
  const filePath = path.join('pacts', `${pacticipant}-${provider}.json`)

  const defaultPact = {
    consumer: { name: pacticipant },
    provider: { name: provider },
    interactions: [],
    metadata: {
      pactSpecification: {
        version: '2.0.0'
      },
      tools: [
        {
          name: 'pact-playwright-js',
          version: '0.0.1',
          adapter: true
        }
      ]
    }
  }
  const pact = readPactFileOrDefault(filePath, defaultPact)
  const url = new URL(route.request().url())
  const request = route.request()
  const resp = await request.response()
  const respBody = await resp?.body()

  const matches = [
    {
      description: `pw_${request.method()}_${url.pathname}_${resp?.status()}${
        url.searchParams.toString() ? '_' + url.searchParams.toString() : ''
      }`,
      request: {
        method: route.request().method(),
        path: url.pathname,
        body: request.postDataJSON() ? request.postDataJSON() : undefined,
        query: url.searchParams.toString() ? url.searchParams.toString() : undefined,
        headers: request.headers() ? omit(request.headers(), [...AUTOGEN_HEADER_BLOCKLIST]) : {}
      },
      response: {
        status: resp?.status(),
        headers: resp?.headers() ? omit(resp?.headers(), [...AUTOGEN_HEADER_BLOCKLIST]) : {},
        body: respBody ? JSON.parse(respBody?.toString()) : undefined
      }
    }
  ]

  pact.interactions = [...pact.interactions, ...matches.flat()]

  writePact(pact, filePath, keepDupeDescs)
}
