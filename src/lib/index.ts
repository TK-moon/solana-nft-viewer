import * as metadata from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import sha256 from 'crypto-js/sha256'
import { bookmarkListType } from './hooks/useLocalStorageBookmarks'

export const getConnectionOptions = (walletAdrs: string) => ({
  filters: [
    { dataSize: 165 }, // NFT 데이터들은 데이터 사이즈가 165
    {
      memcmp: {
        offset: 32,
        bytes: walletAdrs,
      },
    },
  ],
})

export type nftItemType = {
  mint: string
  creators: metadata.Creator[] | null
  uri: string
  lastTransactionTime: Date
  lastCreationTime: Date
  bookmark: boolean
  bookmarkedTime?: Date | null
}

export const checkIsValidWallet = (walletAdrs: string): boolean => {
  try {
    const publickKey = new PublicKey(walletAdrs).toBuffer()
    return PublicKey.isOnCurve(publickKey)
    // 지갑 주소 형식이 맞는지만 확인
  } catch (error) {
    return false
  }
}

const LOCAL_STORAGE_BOOKMARK_KEY = 'BOOKMARK'
const LOCAL_STORAGE_DATA_HASH_KEY = 'DATA_HASH'
const LOCAL_STORAGE_CUSTOM_ORDER_KEY = 'CUSTOM_ORDER'

export type localStorageBookmarksType = { load: () => bookmarkListType; save: (bookmarks: Record<string, any>) => void }
export const localStorageBookmarks = (walletId: string): localStorageBookmarksType => {
  const load = (): bookmarkListType => {
    const data = localStorage.getItem(`${walletId}_${LOCAL_STORAGE_BOOKMARK_KEY}`) || '{}'
    return JSON.parse(data)
  }
  const save = (bookmarks: Record<string, any>) => {
    const data = JSON.stringify(bookmarks)
    localStorage.setItem(`${walletId}_${LOCAL_STORAGE_BOOKMARK_KEY}`, data)
  }

  return { load, save }
}

export type localStorageDataHashType = { load: () => string | null; save: (hash: string) => void }
export const localStorageDataHash = (walletId: string): localStorageDataHashType => {
  const load = () => localStorage.getItem(`${walletId}_${LOCAL_STORAGE_DATA_HASH_KEY}`)
  const save = (hash: string) => localStorage.setItem(`${walletId}_${LOCAL_STORAGE_DATA_HASH_KEY}`, hash)
  return { load, save }
}

export type localStorageCustomOrderType = { load: () => nftItemType[]; save: (list: nftItemType[]) => void }
export const localStorageCustomOrder = (walletId: string) => {
  const load = (): nftItemType[] => {
    const data = localStorage.getItem(`${walletId}_${LOCAL_STORAGE_CUSTOM_ORDER_KEY}`) || '[]'
    return JSON.parse(data)
  }
  const save = (list: nftItemType[]) => {
    const data = JSON.stringify(list)
    localStorage.setItem(`${walletId}_${LOCAL_STORAGE_CUSTOM_ORDER_KEY}`, data)
  }

  return { load, save }
}

export const resizeImageFromHighResolutionImageUrl = async (imageUrl: string, scale: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image()

    const canvas = document.createElement('canvas')
    const context = <CanvasRenderingContext2D>canvas.getContext('2d')

    image.src = imageUrl
    image.crossOrigin = 'Anonymous'
    image.onload = () => {
      canvas.width = image.width * scale
      canvas.height = image.height * scale
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL()
      resolve(dataUrl)
    }
  })

export type OrderType = 'lastTransactionTime' | 'lastCreationTime'

/**
 *
 * @param list
 * @param key
 * @returns sort nftList by bookmarked time first and then key param after
 */
export const sortByKeyDesc = (list: nftItemType[], key: OrderType): nftItemType[] => {
  const array = [...list]
  array.sort((a, b) => {
    // order by bookmared time asc
    if (a.bookmarkedTime && b.bookmarkedTime) return new Date(a.bookmarkedTime).getTime() - new Date(b.bookmarkedTime).getTime()
    // order by is bookmaredTime exist asc
    if (a.bookmarkedTime && !b.bookmarkedTime) return -1
    if (!a.bookmarkedTime && b.bookmarkedTime) return 1
    // order by transaction time desc
    return new Date(b[key]).getTime() - new Date(a[key]).getTime()
  })

  return array
}

export const resetClassNames = () => {
  const dragElement = document.getElementsByClassName('drag')
  const overElement = document.getElementsByClassName('over')
  Array.from(dragElement).forEach(elem => elem.classList.remove('drag'))
  Array.from(overElement).forEach(elem => elem.classList.remove('over'))
}

export const getMintListHashByList = (list: nftItemType[]): string => {
  const mints = list.map(item => item.mint).sort()
  const hash = sha256(JSON.stringify(mints)).toString()
  return hash
}

export const getBookmarkListFromList = (list: nftItemType[]): bookmarkListType => {
  const bookmarks: bookmarkListType = {}
  list.forEach(item => {
    if (item.bookmarkedTime) {
      bookmarks[item.mint] = { bookmark: true, bookmarkedTime: item.bookmarkedTime }
    }
  })
  return bookmarks
}
