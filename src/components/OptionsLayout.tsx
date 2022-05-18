import React from 'react'

interface OptionsLayoutProps {
  title?: string
  children: React.ReactNode
}

const OptionsLayout = (props: OptionsLayoutProps) => (
  <div className='options-layout'>
    <h3 className='options-layout-title'>{props.title}</h3>
    <div className='options-layout-button-container'>{props.children}</div>
  </div>
)

export default OptionsLayout
