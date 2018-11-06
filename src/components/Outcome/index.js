import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import OutcomeCategorical from 'components/Outcome/OutcomeCategorical'
import OutcomeScalar from 'components/Outcome/OutcomeScalar'
import WinningOutcome from 'components/Outcome/WinningOutcome'
import { OUTCOME_TYPES } from 'utils/constants'

const Outcome = ({
  resolved,
  type,
  upperBound,
  lowerBound,
  unit,
  decimals,
  outcomeTokensSold,
  resolution,
  outcomes,
  marginalPrices,
  winningOutcome,
  funding,
  opts = { showOnlyTrendingOutcome: false },
}) => {
  let outcomeComponent = type === OUTCOME_TYPES.CATEGORICAL ? (
    <OutcomeCategorical
      opts={opts}
      resolved={resolved}
      outcomeTokensSold={outcomeTokensSold}
      resolution={resolution}
      funding={funding}
      outcomes={outcomes}
      marginalPrices={marginalPrices}
      winningOutcome={winningOutcome}
    />
  ) : (
    <OutcomeScalar
      opts={opts}
      upperBound={upperBound}
      lowerBound={lowerBound}
      unit={unit}
      decimals={decimals}
      resolved={resolved}
      outcomeTokensSold={outcomeTokensSold}
      resolution={resolution}
      funding={funding}
      marginalPrices={marginalPrices}
      winningOutcome={winningOutcome}
    />
  )

  if (resolved) {
    outcomeComponent = (
      <WinningOutcome
        type={type}
        upperBound={upperBound}
        lowerBound={lowerBound}
        unit={unit}
        decimals={decimals}
        outcomeTokensSold={outcomeTokensSold}
        resolution={resolution}
        outcomes={outcomes}
        winningOutcome={winningOutcome}
      />
    )
  }

  return outcomeComponent
}

Outcome.propTypes = {
  resolved: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(Object.keys(OUTCOME_TYPES)).isRequired,
  upperBound: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lowerBound: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  decimals: PropTypes.number,
  outcomeTokensSold: PropTypes.array.isRequired,
  resolution: PropTypes.string,
  funding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  outcomes: PropTypes.array.isRequired,
  marginalPrices: PropTypes.arrayOf(PropTypes.string),
  winningOutcome: PropTypes.oneOfType([PropTypes.number, ImmutablePropTypes.record]),
  opts: PropTypes.shape({
    showOnlyTrendingOutcome: PropTypes.bool,
    showDate: PropTypes.bool,
    dateFormat: PropTypes.string,
    className: PropTypes.string,
  }),
}

export default Outcome
