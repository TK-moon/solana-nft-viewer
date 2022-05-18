import React, { useState, useLayoutEffect, useReducer, useMemo } from 'react'

import {
  nftItemType,
  OrderType,
  sortByKeyDesc,
  resetClassNames,
  getMintListHashByList,
  localStorageDataHash,
  localStorageCustomOrder,
  getBookmarkListFromList,
} from '../lib/index'

import useLocalStorageBookmarks from '../lib/hooks/useLocalStorageBookmarks'
import useNftListHistory from '../lib/hooks/useNftListHistory'

import OptionsLayout from './OptionsLayout'
import NftItemCard from './NftItemCard'

interface NftListComponentProps {
  walletId: string
  nftList: nftItemType[]
}

type Action =
  | { type: 'SET_LIST'; payload: { list: nftItemType[] } }
  | { type: 'SORT_BY_KEY'; payload: { key: OrderType } }
  | { type: 'UPDATE_BOOKMARK'; payload: { index: number; bookmark: boolean; bookmarkedTime: Date | null } }
  | { type: 'CLEAR_ALL_BOOKMARK' }
  | { type: 'SAVE_CUSTOM_ORDER_TO_LOCAL_STORAGE'; payload: { walletId: string } }

const nftListReducer = (state: nftItemType[], action: Action): nftItemType[] => {
  const tempState = [...state]
  switch (action.type) {
    case 'SET_LIST':
      return action.payload.list
    case 'SORT_BY_KEY':
      return sortByKeyDesc(state, action.payload.key)
    case 'UPDATE_BOOKMARK':
      tempState[action.payload.index] = {
        ...tempState[action.payload.index],
        bookmark: action.payload.bookmark,
        bookmarkedTime: action.payload.bookmarkedTime,
      }
      return tempState
    case 'CLEAR_ALL_BOOKMARK':
      return tempState.map(item => ({ ...item, bookmark: false, bookmarkedTime: null }))
    case 'SAVE_CUSTOM_ORDER_TO_LOCAL_STORAGE': {
      const hash = getMintListHashByList(tempState)
      localStorageDataHash(action.payload.walletId).save(hash)
      localStorageCustomOrder(action.payload.walletId).save(tempState)
      return state
    }
    default:
      return state
  }
}

const NftListComponent = (props: NftListComponentProps) => {
  const [orderBy, setOrderBy] = useState<OrderType>('lastTransactionTime')

  const initNftList = useMemo(() => sortByKeyDesc(props.nftList, orderBy), [props.nftList])
  const [nftList, dispatch] = useReducer(nftListReducer, initNftList)

  const [from, setFrom] = useState<number | null>(null)
  const [to, setTo] = useState<number | null>(null)

  const [bookmarks, dispatchAddBookmark, dispatchDeleteBookmark, dispatchClearBookmark, setBookmak] = useLocalStorageBookmarks(
    props.walletId,
  )

  const [history, , popHistory, pushHistory] = useNftListHistory(props.walletId)

  const updateDataWhenNewListFetched = () => {
    dispatch({ type: 'SET_LIST', payload: { list: initNftList } })
    const bookmarkList = getBookmarkListFromList(initNftList)
    setBookmak(bookmarkList)
  }
  useLayoutEffect(updateDataWhenNewListFetched, [props.nftList])

  useLayoutEffect(() => {
    dispatch({ type: 'SAVE_CUSTOM_ORDER_TO_LOCAL_STORAGE', payload: { walletId: props.walletId } })
  }, [nftList])

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move'
    event.currentTarget.classList.add('drag')
    setFrom(index)
  }

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('drag')
    setFrom(null)
    setTo(null)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    if (nftList[index].bookmark) setTo(null)
    else {
      event.currentTarget.classList.add('over')
      setTo(index)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => event.currentTarget.classList.remove('over')

  const getCustomOrderList = (list: nftItemType[], from: number, to: number) => {
    const nftListExceptDraggingItem: nftItemType[] = list.filter(item => item.mint !== list[from].mint)
    const frontArr = nftListExceptDraggingItem.slice(0, to)
    const backArr = nftListExceptDraggingItem.slice(to)
    const newList = [...frontArr, list[from], ...backArr]
    return newList
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (from === null || to === null) return
    event.preventDefault()
    event.stopPropagation()
    pushHistory(nftList)

    const list = getCustomOrderList(nftList, from, to)
    dispatch({ type: 'SET_LIST', payload: { list } })
    resetClassNames()
  }

  const handleBookmarkClick = (event: React.MouseEvent, index: number, mint: string, isBookmarked: boolean) => {
    event.preventDefault()
    pushHistory(nftList)

    const bookmarkPayload = { index, bookmark: !isBookmarked, bookmarkedTime: isBookmarked ? null : new Date() }
    dispatch({ type: 'UPDATE_BOOKMARK', payload: bookmarkPayload })
    dispatch({ type: 'SORT_BY_KEY', payload: { key: orderBy } })

    if (isBookmarked) dispatchDeleteBookmark(mint)
    else dispatchAddBookmark(mint)
  }

  const resortByKey = (key: OrderType) => {
    pushHistory(nftList)
    dispatch({ type: 'SORT_BY_KEY', payload: { key } })
    setOrderBy(key)
  }

  const clearBookmarks = () => {
    pushHistory(nftList)

    dispatch({ type: 'CLEAR_ALL_BOOKMARK' })
    dispatch({ type: 'SORT_BY_KEY', payload: { key: orderBy } })
    dispatchClearBookmark()
  }

  const undo = () => {
    if (history.length < 1) return

    const prevList = popHistory()
    dispatch({ type: 'SET_LIST', payload: { list: prevList } })

    const bookmarkList = getBookmarkListFromList(prevList)
    setBookmak(bookmarkList)
  }

  return (
    <React.Fragment>
      <OptionsLayout title='ORDER BY'>
        <button
          onClick={() => resortByKey('lastTransactionTime')}
          className='button button-primary'
          type='button'
        >
          Last transaction time
        </button>
        <button
          onClick={() => resortByKey('lastCreationTime')}
          className='button button-primary'
          type='button'
        >
          Last creation time
        </button>
      </OptionsLayout>
      <OptionsLayout title='TOOLS'>
        <button
          onClick={clearBookmarks}
          className='button button-danger'
          disabled={Object.keys(bookmarks).length < 1}
          type='button'
        >
          CLEAR BOOKMARK
        </button>
        <button
          onClick={undo}
          className='button button-danger'
          disabled={history.length < 1}
          type='button'
        >
          UNDO
        </button>
      </OptionsLayout>
      <div className='nft-item-grid'>
        {nftList.map((nftItem, index) => (
          <NftItemCard
            nftItem={nftItem}
            index={index}
            key={`nft-item-${nftItem.mint}`}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleBookmarkClick={handleBookmarkClick}
          />
        ))}
      </div>
    </React.Fragment>
  )
}

export default React.memo(NftListComponent)
