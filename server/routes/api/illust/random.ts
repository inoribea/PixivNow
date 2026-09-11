import { formatInTimeZone } from 'date-fns-tz'
import { PXIMG_BASEURL_I, pixivFetch } from '~~/server/utils/pixiv'
import type { Artwork } from '~~/shared/types/Artworks'

type ArtworkOrAd = Artwork | { isAdContainer: boolean }

// /ajax/illust/discovery errors out (error = true) when max > 18 instead of
// clamping, so clamp it here.
const MAX_ILLUSTS = 18

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestImage =
    (getHeader(event, 'accept')?.includes('image') ||
      query.format === 'image') &&
    query.format !== 'json'

  const requestedMax = Number(query.max)
  const max =
    Number.isFinite(requestedMax) && requestedMax > 0
      ? Math.min(Math.floor(requestedMax), MAX_ILLUSTS)
      : MAX_ILLUSTS

  const { data, status } = await pixivFetch({
    event,
    url: '/ajax/illust/discovery',
    params: {
      mode: query.mode ?? 'safe',
      max: requestImage ? '1' : String(max),
    },
  })

  // Every /ajax/* response is wrapped in { error, message, body }: `data` is
  // that envelope, the actual payload lives in `data.body`.
  if (status !== 200 || data?.error) {
    throw createError({
      statusCode: status === 200 ? 502 : status,
      data,
    })
  }

  const illusts = ((data.body?.illusts ?? []) as ArtworkOrAd[]).filter(
    (value): value is Artwork => Object.keys(value).includes('id')
  )

  illusts.forEach((value) => {
    const middle = `img/${formatInTimeZone(
      value.updateDate,
      'Asia/Tokyo',
      'yyyy/MM/dd/HH/mm/ss'
    )}/${value.id}`
    value.urls = {
      mini: `${PXIMG_BASEURL_I}c/48x48/img-master/${middle}_p0_square1200.jpg`,
      thumb: `${PXIMG_BASEURL_I}c/250x250_80_a2/img-master/${middle}_p0_square1200.jpg`,
      small: `${PXIMG_BASEURL_I}c/540x540_70/img-master/${middle}_p0_master1200.jpg`,
      regular: `${PXIMG_BASEURL_I}img-master/${middle}_p0_master1200.jpg`,
      original: `${PXIMG_BASEURL_I}img-original/${middle}_p0.jpg`,
    }
  })

  if (requestImage) {
    const url = illusts[0]?.urls?.regular
    if (!url) {
      throw createError({ statusCode: 404, message: 'No image found' })
    }
    return sendRedirect(event, url)
  } else {
    return illusts
  }
})
