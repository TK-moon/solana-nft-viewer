import React, { useLayoutEffect, useMemo, useReducer } from 'react'
import { localStorageBookmarks, localStorageBookmarksType } from '../index'

type bookmarkObjectType = { bookmark: boolean; bookmarkedTime: Date }
export type bookmarkListType = Record<string, bookmarkObjectType>

type Action =
  | { type: 'ADD_BOOKMARK'; payload: { mint: string } }
  | { type: 'DELETE_BOOKMARK'; payload: { mint: string } }
  | { type: 'CLEAR_BOOKMARK' }
  | { type: 'SET_BOOKMARKS'; payload: bookmarkListType }

const bookmarkReducer = (state: bookmarkListType, action: Action) => {
  const tempState = { ...state }
  switch (action.type) {
    case 'ADD_BOOKMARK':
      tempState[action.payload.mint] = { bookmark: true, bookmarkedTime: new Date() }
      return tempState
    case 'DELETE_BOOKMARK':
      delete tempState[action.payload.mint]
      return tempState
    case 'CLEAR_BOOKMARK':
      return {}
    case 'SET_BOOKMARKS':
      return action.payload
    default:
      return state
  }
}

type addBookmarkType = (mint: string) => void
type deleteBookmarkType = (mint: string) => void
type clearBookmarkType = () => void
type setBookmarkType = (bookmarks: bookmarkListType) => void

type useLocalStorageBookmarksType = [bookmarkListType, addBookmarkType, deleteBookmarkType, clearBookmarkType, setBookmarkType]

const useLocalStorageBookmarks = (walletId: string): useLocalStorageBookmarksType => {
  const localStorageBookmarkList = useMemo<localStorageBookmarksType>(() => localStorageBookmarks(walletId), [walletId])
  const [bookmarks, dispatch] = useReducer(bookmarkReducer, localStorageBookmarkList.load())

  useLayoutEffect(() => {
    localStorageBookmarkList.save(bookmarks)
  }, [bookmarks, localStorageBookmarkList])

  const addBookmark = (mint: string) => {
    dispatch({ type: 'ADD_BOOKMARK', payload: { mint } })
  }

  const deleteBookmark = (mint: string) => {
    dispatch({ type: 'DELETE_BOOKMARK', payload: { mint } })
  }

  const clearBookmark = () => {
    dispatch({ type: 'CLEAR_BOOKMARK' })
  }

  const setBookmak = (bookmarks: bookmarkListType) => {
    dispatch({ type: 'SET_BOOKMARKS', payload: bookmarks })
  }

  return [bookmarks, addBookmark, deleteBookmark, clearBookmark, setBookmak]
}

export default useLocalStorageBookmarks
