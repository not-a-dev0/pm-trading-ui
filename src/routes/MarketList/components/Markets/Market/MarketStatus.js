import React from 'react'
import PropTypes from 'prop-types'
import Countdown from 'components/Countdown'
import classNames from 'classnames/bind'
import { RESOLUTION_TIME } from 'utils/constants'
import Icon from 'components/Icon'

import css from './Market.scss'

const cx = classNames.bind(css)


const MarketStatus = ({ resolved, closed, resolution }) => {
  const hasStatus = resolved || closed
  const status = resolved ? 'resolved' : 'closed'
  const iconType = hasStatus ? 'checkmark' : 'countdown'

  return (
    <div className={cx('marketInfo')}>
      <Icon type={iconType} size={25} />
      <div className={cx('label')}>
        { hasStatus
          ? status
          : <Countdown target={resolution} format={RESOLUTION_TIME.RELATIVE_FORMAT} interval={10000} />
        }
      </div>
    </div>
  )
}

MarketStatus.propTypes = {
  resolved: PropTypes.bool.isRequired,
  closed: PropTypes.bool.isRequired,
  resolution: PropTypes.string.isRequired,
}

export default MarketStatus
