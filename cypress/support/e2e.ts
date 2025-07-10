// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  return false
})

// Global beforeEach hook
beforeEach(() => {
  // Clear any stored data between tests
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Mock Mapbox API calls
  cy.intercept('GET', '**/mapbox.places/**', (req) => {
    const query = String(req.query.q || req.query.query || '')
    
    // Mock different responses based on search query
    if (query.toLowerCase().includes('invalidsearchterm')) {
      req.reply({ fixture: 'mapbox-search-no-results.json' })
    } else if (query.toLowerCase().includes('starbucks') || 
               query.toLowerCase().includes('mcdonald') ||
               query.toLowerCase().includes('philadelphia') ||
               query.toLowerCase().includes('new york') ||
               query.toLowerCase().includes('central park') ||
               query.toLowerCase().includes('golden gate')) {
      req.reply({ fixture: 'mapbox-search-success.json' })
    } else {
      req.reply({ fixture: 'mapbox-search-no-results.json' })
    }
  }).as('mapboxSearch')
  
  // Mock Mapbox API error for unauthorized requests
  cy.intercept('GET', '**/mapbox.places/**', (req) => {
    if (!req.query.access_token) {
      req.reply({ 
        statusCode: 401,
        fixture: 'mapbox-search-error.json'
      })
    }
  }).as('mapboxSearchError')
}) 