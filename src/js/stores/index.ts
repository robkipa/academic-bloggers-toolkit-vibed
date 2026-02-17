/**
 * Provide regeneratorRuntime for generator-based resolvers in the editor iframe.
 * Required because the data store's getCitationStyles resolver uses function*.
 */
import 'regenerator-runtime/runtime';

import { registerStore } from '@wordpress/data';

import dataStore from './data';
import uiStore from './ui';

registerStore(...dataStore);
registerStore(...uiStore);
