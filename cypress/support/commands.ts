/// <reference types="cypress" />

// Custom commands for KMLchemy application

// Custom command to search for a location
Cypress.Commands.add('searchLocation', (query: string) => {
  cy.get('[data-testid="location-search-input"]').clear().type(query)
  cy.get('[data-testid="location-search-button"]').click()
  cy.get('[data-testid="location-search-loading"]').should('not.exist')
  cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
})

// Custom command to add a location from search results
Cypress.Commands.add('addLocationFromSearch', (locationName: string) => {
  cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
  cy.get('[data-testid^="location-search-result-"]').first().click()
  cy.get('[data-testid="location-search-dropdown"]').should('not.exist')
})

// Custom command to remove a location from the list
Cypress.Commands.add('removeLocation', (locationId: string) => {
  cy.get(`[data-testid="location-item-remove-${locationId}"]`).click()
})

// Custom command to bulk import addresses
Cypress.Commands.add('bulkImportAddresses', (addresses: string[]) => {
  const addressesText = addresses.join('\n')
  cy.get('[data-testid="bulk-import-textarea"]').clear().type(addressesText)
  cy.get('[data-testid="bulk-import-button"]').click()
})

// Custom command to export KML file
Cypress.Commands.add('exportKML', () => {
  cy.get('[data-testid="export-button"]').click()
  cy.get('[data-testid="export-success-alert"]').should('be.visible')
})

// Custom command to wait for search results
Cypress.Commands.add('waitForSearchResults', () => {
  cy.get('[data-testid="location-search-loading"]').should('not.exist')
  cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
})

// Custom command to check if location list is empty
Cypress.Commands.add('checkEmptyLocationList', () => {
  cy.get('[data-testid="location-list-empty"]').should('be.visible')
  cy.get('[data-testid="location-list-empty-title"]').should('contain', 'No locations added')
}) 