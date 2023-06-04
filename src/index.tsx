/**
 * This file feels unnecessary but it is to avoid 
 * Webpack Module Federation plugin from throwing error that eager loading cannot be shared.
 */
import('./App')
export {}