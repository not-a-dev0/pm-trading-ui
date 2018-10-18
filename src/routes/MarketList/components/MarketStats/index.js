import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames/bind'

import Icon from 'components/Icon'

import css from './MarketStats.scss'

const cx = classNames.bind(css)

const Stat = ({ name, value, icon }) => (
  <div className={cx('stat')}>
    <Icon type={icon} size={50} float="left" />
    <div className={cx('content')}>
      <span className={cx('value')}>{value}</span>
      <div className={cx('label')}>{name}</div>
    </div>
  </div>
)

Stat.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
}

const MarketStats = ({ open, newMarkets, endingSoon }) => (
  <div className={cx('marketStats')}>
    <div className="container">
      <div className="row">
        <div className={cx('col-xs-12')}>
          <div className={cx('inner')}>
            <Stat name="Open Markets" value={open} icon="market" />
            <Stat name="Ending Soon" value={endingSoon} icon="market--countdown" />
            <Stat name="New Markets" value={newMarkets} icon="new" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

MarketStats.propTypes = {
  open: PropTypes.number.isRequired,
  newMarkets: PropTypes.number.isRequired,
  endingSoon: PropTypes.number.isRequired,
}

export default MarketStats
