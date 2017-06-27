/* globals fetch */

import { normalize } from 'normalizr'

import {
  marketSchema,
  oracleSchema,
  eventSchema,
  eventDescriptionSchema,
} from './schema'

const API_URL = ''

export const requestMarkets = async () =>
  fetch(`${API_URL}/api/markets/`)
    .then(response => response.json())
    .then(response => normalize(response.results, [marketSchema]))
