import React, { useEffect, useRef } from 'react'
import { useQuery } from 'react-query'

import { nftItemType, resizeImageFromHighResolutionImageUrl } from '../lib/index'

interface NftItemCardProps {
  index: number
  nftItem: nftItemType
  handleDragStart: (event: React.DragEvent<HTMLDivElement>, index: number) => void
  handleDragEnd: (event: React.DragEvent<HTMLDivElement>) => void
  handleDragEnter: (event: React.DragEvent<HTMLDivElement>, index: number) => void
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (event: any, index: number) => void
  handleBookmarkClick: (event: React.MouseEvent, index: number, mint: string, isBookmarked: boolean) => void
}

const NftItemCard = (props: NftItemCardProps) => {
  const imageDivRef = useRef<HTMLDivElement>(null)

  const fetchFromNftUri = async (): Promise<{ image: string; name: string }> => {
    const response = await fetch(props.nftItem.uri)
    const data = await response.json()
    return data
  }

  const { data } = useQuery(props.nftItem.mint, fetchFromNftUri)

  const setThumbnailImage = async () => {
    if (!imageDivRef.current || !data) return
    const resizedImageDataUrl = await resizeImageFromHighResolutionImageUrl(data.image, 0.1)
    imageDivRef.current.style.backgroundImage = `url(${resizedImageDataUrl})`
  }

  useEffect(() => {
    if (!imageDivRef.current) return
    setThumbnailImage()
  }, [imageDivRef])

  return (
    <div
      className='nft-list-item'
      draggable={!props.nftItem.bookmark}
      onDragStart={event => props.handleDragStart(event, props.index)}
      onDragEnd={props.handleDragEnd}
      onDragEnter={event => props.handleDragEnter(event, props.index)}
      onDragLeave={props.handleDragLeave}
      onDrop={event => props.handleDrop(event, props.index)}
      onDragOver={event => event.preventDefault()}
    >
      <button
        className={`nft-list-item-bookmark ${props.nftItem.bookmark && 'bookmarked'}`}
        onClick={event => props.handleBookmarkClick(event, props.index, props.nftItem.mint, props.nftItem.bookmark)}
        type='button'
      />
      <a
        href={`https://solscan.io/token/${props.nftItem.mint}`}
        target='_blank'
        rel='noreferrer'
        draggable='false'
      >
        <div
          className='nft-list-item-image'
          ref={imageDivRef}
        />
        <div className='nft-list-item-desc'>
          <h4>{data?.name}</h4>
          <p title={props.nftItem.mint}>
            {props.nftItem.mint.slice(0, 4)}
            ...
            {props.nftItem.mint.slice(-4)}
          </p>
        </div>
      </a>
    </div>
  )
}

export default NftItemCard
