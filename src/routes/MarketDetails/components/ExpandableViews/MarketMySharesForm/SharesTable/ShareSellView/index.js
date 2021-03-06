import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { compose } from 'recompose'
import { withNamespaces } from 'react-i18next'
import Decimal from 'decimal.js'
import PropTypes from 'prop-types'
import web3 from 'web3'
import ImmutablePropTypes from 'react-immutable-proptypes'
import cn from 'classnames/bind'
import { reduxForm, propTypes, Field } from 'redux-form'
import { Map } from 'immutable'
import InteractionButton from 'containers/InteractionButton'
import DecimalValue from 'components/DecimalValue'
import CurrencyName from 'components/CurrencyName'
import { Slider, TextInput, MandatoryHint } from 'components/Form'
import Hairline from 'components/layout/Hairline'
import IndefiniteSpinner from 'components/Spinner/Indefinite'
import { marketShape, marketShareShape } from 'utils/shapes'
import { LIMIT_MARGIN, OUTCOME_TYPES, GAS_COST } from 'utils/constants'
import { weiToEth, normalizeScalarPoint } from 'utils/helpers'
import { NUMBER_REGEXP } from 'routes/MarketDetails/components/ExpandableViews/MarketBuySharesForm/utils'
import {
  calculateCurrentProbability, calculateEarnings, calculateNewProbability, validateTokenCount,
} from './utils'
import style from './ShareSellView.scss'

const cx = cn.bind(style)

const inputErrorStyle = {
  whiteSpace: 'nowrap',
}

class ShareSellView extends Component {
  componentDidUpdate() {
    const { selectedSellAmount, share, initialize } = this.props
    const newShareSellOpened = selectedSellAmount === undefined && share.id !== undefined

    if (newShareSellOpened) {
      // Form reset / reinitialization when switching among shares
      const fullAmount = Decimal(share.balance)
        .div(1e18)
        .toDP(4, 1)
        .toString()
      initialize({ sellAmount: fullAmount, limitMargin: LIMIT_MARGIN })
    }
  }

  @autobind
  validateTokenCount(val) {
    const { share, market, t } = this.props
    if (!val || !NUMBER_REGEXP.test(val) || Decimal(val).lt(1e-18)) {
      return t('market.errors.invalid_amount')
    }

    const decimalValue = Decimal(val)
    const earnings = calculateEarnings(market, share, web3.utils.toWei(val))

    if (decimalValue.lt(0)) {
      return t('market.errors.negative_number')
    }

    if (decimalValue.gt(Decimal(share.balance).div(1e18))) {
      return t('market.errors.not_enough_balance')
    }

    if (Decimal(0).eq(earnings)) {
      return t('market.errors.loss_detected')
    }

    return undefined
  }

  render() {
    const {
      market,
      invalid,
      submitting,
      submitFailed,
      selectedSellAmount,
      handleSubmit,
      share,
      gasCosts,
      gasPrice,
      isGasPriceFetched,
      isGasCostFetched,
      valid,
      sellFormHasErrors,
      error,
      handleSellShare,
      t,
    } = this.props

    const sellSharesGasCost = gasCosts.get('sellShares')
    const submitDisabled = invalid || submitting || sellFormHasErrors
    let submitDisabledReason
    if (invalid) {
      submitDisabledReason = t('market.errors.invalid_amount')
    } else if (sellFormHasErrors) {
      submitDisabledReason = error
    }

    let selectedSellAmountWei
    try {
      selectedSellAmountWei = web3.utils.toWei(selectedSellAmount)
    } catch (e) {
      selectedSellAmountWei = '0'
    }

    const gasCostEstimation = weiToEth(gasPrice.mul(sellSharesGasCost))
    const currentProbability = calculateCurrentProbability(market, share)
    const currentTokenBalance = share && share.balance ? new Decimal(share.balance) : new Decimal(0)

    let newTokenBalance = currentTokenBalance
    let earnings = 0
    let newProbability = currentProbability
    let newNetOutcomeTokensSold = market.netOutcomeTokensSold
    let newMarginalPrices
    let newScalarPredictedValue

    if (market.type === OUTCOME_TYPES.SCALAR) {
      newMarginalPrices = [new Decimal(1).sub(currentProbability), newProbability]
      newScalarPredictedValue = normalizeScalarPoint(newMarginalPrices, market)
    }

    // Run the calculations only if the form is valid
    if (valid) {
      newTokenBalance = currentTokenBalance.sub(selectedSellAmountWei)
      earnings = calculateEarnings(market, share, selectedSellAmountWei)
      newNetOutcomeTokensSold = market.outcomeTokensSold.map((outcomeTokenAmount, outcomeTokenIndex) => {
        if (outcomeTokenIndex === share.outcomeToken.index && !currentTokenBalance.sub(newTokenBalance).isZero()) {
          return Decimal(outcomeTokenAmount)
            .sub(currentTokenBalance.sub(newTokenBalance))
            .floor()
            .toString()
        }

        return outcomeTokenAmount
      })

      try {
        newProbability = calculateNewProbability(market, share, newNetOutcomeTokensSold.toArray())
      } catch (e) {
        console.error(e)
      }

      if (market.type === OUTCOME_TYPES.SCALAR) {
        newMarginalPrices = [new Decimal(1).sub(newProbability), newProbability]
        newScalarPredictedValue = normalizeScalarPoint(newMarginalPrices, market)
      }
    }
    const submitHandler = handleSubmit(() => handleSellShare(share.id, selectedSellAmount, earnings))

    const hairlineStyle = {
      backgroundColor: '#d5d4d6',
      height: '0.5px',
      marginTop: '40px',
    }

    return (
      <tr className={cx('sellView')}>
        <td colSpan={5}>
          <div className={cx('sellViewContainer')}>
            <form onSubmit={submitHandler}>
              <div className={cx('row', 'sellRow')}>
                <div className={cx('col-md-4', 'sellColumn')}>
                  <label htmlFor="sellAmount">
                    {t('market.sell_amount')}
                    <MandatoryHint />
                  </label>
                  <Field
                    component={TextInput}
                    name="sellAmount"
                    placeholder={t('market.sell_enter_amount')}
                    className={cx('sharesSellAmount')}
                    errorStyle={inputErrorStyle}
                  />
                </div>

                {market.type === 'SCALAR' ? (
                  <div className={cx('col-md-4', 'sellColumn')}>
                    <label>{t('market.new_predicted_value')}</label>
                    <span>
                      <DecimalValue value={newScalarPredictedValue} />
                      &nbsp;
                      <span>{market.bounds.unit}</span>
                    </span>
                  </div>
                ) : (
                  <div className={cx('col-md-4', 'sellColumn')}>
                    <label>{t('market.new_probability')}</label>
                    <span>
                      <DecimalValue value={newProbability.mul(100)} /> %
                    </span>
                  </div>
                )}
                <div className={cx('col-md-3', 'sellColumn')}>
                  <label>{t('market.gas_cost')}</label>
                  <span>
                    {isGasPriceFetched && isGasCostFetched(GAS_COST.SELL_SHARES) ? (
                      <>
                        <DecimalValue value={gasCostEstimation} decimals={5} />
                        &nbsp;ETH
                      </>
                    ) : (
                      <IndefiniteSpinner width={16} height={16} />
                    )}
                  </span>
                </div>
              </div>
              <Hairline style={hairlineStyle} />
              <div className={cx('row', 'sellRow')}>
                <div className={cx('col-md-4')} style={{ paddingLeft: 8 }}>
                  <label htmlFor="limitMargin">{t('market.limit_margin')}</label>
                  <Field
                    name="limitMargin"
                    component={Slider}
                    className={cx('formSlider')}
                    placeholder={LIMIT_MARGIN}
                    min={0}
                    max={5}
                    unit="%"
                    step={0.5}
                    showInput={false}
                    light
                  />
                </div>
                <div className={cx('col-md-2')} />
                <div className={cx('col-md-4', 'sellColumn')}>
                  <div className={cx('sellColumnInfo')}>
                    <label>{t('market.earnings')}</label>
                    <span>
                      <DecimalValue value={earnings} />
                      &nbsp;
                      <CurrencyName tokenAddress={market.collateralToken} />
                    </span>
                  </div>
                  <InteractionButton
                    loading={submitting}
                    disabled={submitDisabled}
                    error={submitDisabledReason}
                    className={cx('btn', 'btn-block', 'btn-primary')}
                    type="submit"
                  >
                    {t('market.sell_tokens')}
                  </InteractionButton>
                </div>
              </div>
              {submitFailed && (
                <div className={cx('row')}>
                  <div className={cx('col-md-9', 'sellErrorField')}>
                    {t('market.submit_error')}
                  </div>
                </div>
              )}
            </form>
          </div>
        </td>
      </tr>
    )
  }
}

ShareSellView.propTypes = {
  ...propTypes,
  isGasCostFetched: PropTypes.func.isRequired,
  gasCosts: ImmutablePropTypes.map,
  gasPrice: PropTypes.instanceOf(Decimal),
  isGasPriceFetched: PropTypes.bool,
  market: marketShape,
  selectedSellAmount: PropTypes.string,
  handleSellShare: PropTypes.func,
  share: marketShareShape,
  sellFormHasErrors: PropTypes.bool,
  t: PropTypes.func.isRequired,
}

ShareSellView.defaultProps = {
  market: {},
  gasCosts: Map({}),
  gasPrice: Decimal(0),
  selectedSellAmount: undefined,
  handleSellShare: () => {},
  share: {},
  isGasPriceFetched: false,
  sellFormHasErrors: false,
}

export const FORM = {
  form: 'marketMyShares',
  validate: validateTokenCount,
  destroyOnUnmount: true,
}

const enhancer = compose(
  reduxForm(FORM),
  withNamespaces(),
)

export default enhancer(ShareSellView)
