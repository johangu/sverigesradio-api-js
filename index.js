const { get } = require('https')
const querystring = require('querystring')
const { URL } = require('url')

const BASE_URL = 'https://api.sr.se/api/v2/'

const defaultOptions = {
  audioquality: 'hi',
  callback: null,
  filter: null,
  filtervalue: null,
  format: 'json',
  indent: false,
  liveaudiotemplateid: 2,
  ondemandaudiotemplateid: 1,
  page: 1,
  pagination: false,
  size: 10,
  sort: null
}

async function call ({ endpoint, id, ...opts }) {
  const params = { ...defaultOptions, ...opts }
  const callURL = new URL(`${endpoint}/${id || ''}`, BASE_URL)
  callURL.search = querystring.stringify(params)

  return new Promise((resolve, reject) => {
    get(callURL, res => {
      let rawData = ''
      res.on('data', data => (rawData += data))

      res.on('end', _ => {
        let responseData
        if (['json', 'jsonp'].includes(params.format)) {
          try {
            responseData = JSON.parse(rawData)
          } catch (e) {
            throw e
          }
        } else {
          responseData = rawData.toString()
        }

        resolve(responseData)
      })
    }).on('error', reject)
  })
}

async function channel (id, opts) {
  return channels(...opts, id)
}

async function channels (opts, id = null) {
  return call({
    endpoint: 'channels',
    id,
    ...opts
  })
}

async function program (id, opts) {
  return programs({ id, ...opts })
}

async function programs ({ id, ...opts }) {
  return call({
    endpoint: 'programs',
    id,
    ...opts
  })
}

async function programCategory (id) {
  return programCategories(id)
}

async function programCategories (id) {
  return call({
    endpoint: 'programcategories',
    id
  })
}

async function episodesByProgram (programid) {
  return call({
    endpoint: 'episodes',
    programid
  })
}

async function episodeById (id) {
  return call({
    endpoint: `episodes/get`,
    id
  })
}

async function schedule ({ rightNow, ...opts }) {
  return call({
    endpoint: `scheduledepisodes/${rightNow ? 'rightnow' : ''}`,
    ...opts
  })
}

async function playlists ({ endpoint, ...opts }) {
  return call({
    endpoint: `playlists/${endpoint || ''}`,
    ...opts
  })
}

async function playlistRightNow ({ channelid, ...opts }) {
  if (!channelid) throw new Error('No channel ID supplied')
  return playlists({
    endpoint: 'rightnow',
    channelid,
    ...opts
  })
}

async function playlistForEpisode ({ id, ...opts }) {
  if (!id) throw new Error('No episode ID supplied')
  return playlists({
    endpoint: 'getplaylistbyepisodeid',
    id,
    ...opts
  })
}

module.exports = {
  channel,
  channels,
  schedule,
  playlists,
  playlistRightNow,
  playlistForEpisode,
  program,
  programs,
  programCategories,
  programCategory,
  episodeById,
  episodesByProgram
}
