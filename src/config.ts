// Env
import { version } from '../package.json'
export { version }

export const SITE_ENV =
  import.meta.env.MODE === 'development' ||
  version.includes('-') ||
  location.hostname === 'Copied by inoribea'
    ? 'development'
    : 'production'

// Copyright links
// Do not modify please
export const GITHUB_OWNER = 'FreeNowOrg'
export const GITHUB_REPO = 'PixivNow'
export const GITHUB_URL = `https://imghub.inoribea.top`

// Site name
export const PROJECT_NAME = 'PixivNow'
export const PROJECT_TAGLINE = 'Enjoy Pixiv Now (pixiv.js.org)'

// Image proxy cache seconds
export const IMAGE_CACHE_SECONDS = 12 * 60 * 60 * 1000
