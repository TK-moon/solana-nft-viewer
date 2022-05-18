import React, { useState, useLayoutEffect } from 'react'
import { nftItemType } from '../index'

type useNftListHistoryType = [
  nftItemType[][],
  React.Dispatch<React.SetStateAction<nftItemType[][]>>,
  () => nftItemType[],
  (list: nftItemType[]) => void
]

const useNftListHistory = (walletId: string): useNftListHistoryType => {
  const [history, setHistory] = useState<nftItemType[][]>([])

  useLayoutEffect(() => {
    setHistory([])
  }, [walletId])

  const popHistory = () => {
    const tempHistory = [...history]
    const list = tempHistory.pop() || []
    setHistory(tempHistory)
    return list
  }

  const pushHistory = (list: nftItemType[]) => {
    const currentList = [...list]
    const tempHistory = [...history].slice(-3)
    tempHistory.push(currentList)
    setHistory(tempHistory)
  }

  return [history, setHistory, popHistory, pushHistory]
}

export default useNftListHistory
