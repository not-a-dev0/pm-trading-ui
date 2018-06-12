import React from 'react'
import cn from 'classnames/bind'
import PropTypes from 'prop-types'
import { lifecycle } from 'recompose'
import { Link, withRouter } from 'react-router-dom'
import Decimal from 'decimal.js'
import { ETHEREUM_NETWORK_IDS } from 'integrations/constants'
import { getFeatureConfig } from 'utils/features'
import IndefiniteSpinner from 'components/Spinner/Indefinite'
import style from './ClaimReward.mod.scss'

const cx = cn.bind(style)
const { rewardToken } = getFeatureConfig('rewards')

const ClaimReward = ({
  closeModal,
  gasPrice,
  currentNetwork,
  currentNetworkId,
  claimUserRewards,
  claimRewardGasCost,
  currentBalance,
  rewardValue,
}) => {
  const handleRegistration = async () => {
    await claimUserRewards()
    closeModal()
  }

  const targetNetwork = ETHEREUM_NETWORK_IDS[rewardToken.networkId]
  const isWrongNetwork = !Decimal(currentNetworkId).eq(rewardToken.networkId)
  const hasGasCosts = typeof gasPrice === 'undefined' || typeof claimRewardGasCost === 'undefined'

  let sufficentFunds = Decimal(currentBalance).gte(0)
  if (hasGasCosts) {
    sufficentFunds = Decimal(gasPrice)
      .mul(claimRewardGasCost)
      .lt(currentBalance)
  }

  const disabled = !sufficentFunds || isWrongNetwork

  return (
    <div className={cx('claimRewards')}>
      <button className={cx('closeButton')} onClick={closeModal} />
      <div className={cx('claimContainer')}>
        <h4 className={cx('heading')}>Claim {rewardToken.symbol}</h4>
        <p className={cx('annotation')}>
          In order to claim your{' '}
          <span className={cx('rewardInfo')}>
            {rewardValue} {rewardToken.symbol}
          </span>{' '}
          tokens, you first have to switch to the <span className={cx('network')}>{targetNetwork}</span> network in your
          MetaMask wallet. Also make sure you have enough ETH to submit the transaction with the claim request. More
          information in{' '}
          <Link to="/game-guide" href="/game-guide" className={cx('faqLink')}>
            FAQ
          </Link>.
        </p>
        <div className={cx('currentNetworkContainer')}>
          Current network:
          <span className={cx('network', { wrongNetwork: isWrongNetwork })}>{currentNetwork}</span>
        </div>
        {!isWrongNetwork && (
          <p className={cx('gasCosts')}>
            Estimated Gas Costs:{' '}
            {hasGasCosts ? (
              <b className={cx('gasEstimation')}>
                {Decimal(gasPrice)
                  .mul(claimRewardGasCost)
                  .toString()}
              </b>
            ) : (
              <IndefiniteSpinner width={18} height={18} />
            )}

          </p>
        )}
        <button onClick={handleRegistration} className={cx('btn', 'btn-primary', 'claim')} disabled={disabled}>
          CLAIM
        </button>
      </div>
    </div>
  )
}

ClaimReward.propTypes = {
  closeModal: PropTypes.func.isRequired,
  currentBalance: PropTypes.string.isRequired,
  requestClaimRewardGasCost: PropTypes.func.isRequired,
  currentNetwork: PropTypes.string,
  currentNetworkId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  gasPrice: PropTypes.instanceOf(Decimal),
  claimRewardGasCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  claimUserRewards: PropTypes.func.isRequired,
  rewardValue: PropTypes.number.isRequired,
}

ClaimReward.defaultProps = {
  currentNetworkId: 0,
  currentNetwork: '',
  gasPrice: Decimal(0),
  claimRewardGasCost: Decimal(0),
}

export default withRouter(lifecycle({
  componentDidMount() {
    this.props.requestGasPrice()
    this.props.requestClaimRewardGasCost()
  },
})(ClaimReward))
