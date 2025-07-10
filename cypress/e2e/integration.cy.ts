describe('KMLchemy Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete a full workflow: search, add, and export', () => {
    // Step 1: Verify initial state
    cy.get('[data-testid="location-list-empty"]').should('be.visible')
    cy.get('[data-testid="export-button"]').should('be.disabled')

    // Step 2: Search for a location
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Wait for search results
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    
    // Step 3: Add a location from search results
    cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Step 4: Verify location was added
    cy.get('[data-testid="location-list-empty"]').should('not.exist')
    cy.get('[data-testid="location-list"]').should('be.visible')
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
    
    // Step 5: Verify export button is enabled
    cy.get('[data-testid="export-button"]').should('not.be.disabled')
    cy.get('[data-testid="export-button"]').should('contain', 'Export 1 Location')
    
    // Step 6: Export KML file
    cy.get('[data-testid="export-button"]').click()
    cy.get('[data-testid="export-success-alert"]').should('be.visible')
    cy.get('[data-testid="export-success-message"]').should('contain', 'KML file exported successfully')
  })

  it('should handle bulk import workflow', () => {
    // Step 1: Use example data
    cy.get('[data-testid="bulk-import-use-example-button"]').click()
    cy.get('[data-testid="bulk-import-textarea"]').should('not.have.value', '')
    
    // Step 2: Start bulk import
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Step 3: Wait for processing
    cy.get('[data-testid="bulk-import-progress"]').should('be.visible')
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    // Step 4: Verify results
    cy.get('[data-testid="bulk-import-results"]').should('be.visible')
    cy.get('[data-testid="bulk-import-success-alert"]').should('be.visible')
    
    // Step 5: Verify locations were added to list
    cy.get('[data-testid="location-list"]').should('be.visible')
    cy.get('[data-testid="location-list-count"]').should('not.contain', '0')
    
    // Step 6: Export should be enabled
    cy.get('[data-testid="export-button"]').should('not.be.disabled')
  })

  it('should handle removing locations', () => {
    // Step 1: Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Step 2: Verify location is added
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
    
    // Step 3: Remove the location
    cy.get('[data-testid^="location-item-remove-"]').first().click()
    
    // Step 4: Verify location is removed
    cy.get('[data-testid="location-list-empty"]').should('be.visible')
    cy.get('[data-testid="export-button"]').should('be.disabled')
  })

  it('should handle multiple locations workflow', () => {
    // Step 1: Add first location
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Step 2: Add second location
    cy.get('[data-testid="location-search-input"]').type('McDonald\'s New York')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Step 3: Verify both locations are added
    cy.get('[data-testid="location-list-count"]').should('contain', '2')
    cy.get('[data-testid="export-button"]').should('contain', 'Export 2 Locations')
    
    // Step 4: Export multiple locations
    cy.get('[data-testid="export-button"]').click()
    cy.get('[data-testid="export-success-alert"]').should('be.visible')
  })

  it('should handle search with no results', () => {
    // Step 1: Search for invalid term
    cy.get('[data-testid="location-search-input"]').type('InvalidSearchTerm12345')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Step 2: Wait for search to complete
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    
    // Step 3: Verify no results message
    cy.get('[data-testid="location-search-no-results"]').should('be.visible')
    cy.get('[data-testid="location-search-no-results-message"]').should('contain', 'No results found')
    
    // Step 4: Verify no locations were added
    cy.get('[data-testid="location-list-empty"]').should('be.visible')
    cy.get('[data-testid="export-button"]').should('be.disabled')
  })

  it('should handle bulk import with mixed results', () => {
    // Step 1: Add mixed valid and invalid addresses
    const mixedAddresses = 'Starbucks, Philadelphia, PA\nInvalid Address 12345\nMcDonald\'s, New York, NY'
    cy.get('[data-testid="bulk-import-textarea"]').type(mixedAddresses)
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Step 2: Wait for processing
    cy.get('[data-testid="bulk-import-progress"]').should('be.visible')
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    // Step 3: Verify mixed results
    cy.get('[data-testid="bulk-import-success-count"]').should('be.visible')
    cy.get('[data-testid="bulk-import-error-count"]').should('be.visible')
    
    // Step 4: Verify some locations were added
    cy.get('[data-testid="location-list"]').should('be.visible')
    cy.get('[data-testid="location-list-count"]').should('not.contain', '0')
  })

  it('should maintain state across page interactions', () => {
    // Step 1: Add a location
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Step 2: Interact with other sections
    cy.get('[data-testid="bulk-import-use-example-button"]').click()
    cy.get('[data-testid="app-header"]').click()
    
    // Step 3: Verify location is still there
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
    cy.get('[data-testid="export-button"]').should('not.be.disabled')
  })

  it('should handle responsive layout', () => {
    // Test mobile layout
    cy.viewport(375, 667)
    cy.get('[data-testid="app-header"]').should('be.visible')
    cy.get('[data-testid="search-section"]').should('be.visible')
    cy.get('[data-testid="results-section"]').should('be.visible')
    
    // Test tablet layout
    cy.viewport(768, 1024)
    cy.get('[data-testid="app-header"]').should('be.visible')
    cy.get('[data-testid="search-section"]').should('be.visible')
    cy.get('[data-testid="results-section"]').should('be.visible')
    
    // Test desktop layout
    cy.viewport(1280, 720)
    cy.get('[data-testid="app-header"]').should('be.visible')
    cy.get('[data-testid="search-section"]').should('be.visible')
    cy.get('[data-testid="results-section"]').should('be.visible')
  })

  it('should handle complex search scenarios', () => {
    // Test searching for different types of locations
    const searchTerms = ['Starbucks Philadelphia', 'McDonald\'s New York', 'Central Park New York']
    
    searchTerms.forEach((term, index) => {
      cy.get('[data-testid="location-search-input"]').clear().type(term)
      cy.get('[data-testid="location-search-button"]').click()
      cy.wait('@mapboxSearch')
      cy.get('[data-testid="location-search-loading"]').should('not.exist')
      cy.get('[data-testid^="location-search-result-"]').first().click()
      
      // Verify location count increases
      cy.get('[data-testid="location-list-count"]').should('contain', String(index + 1))
    })
    
    // Verify export button shows correct count
    cy.get('[data-testid="export-button"]').should('contain', 'Export 3 Locations')
  })
}) 