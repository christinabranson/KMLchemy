describe('Location List', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display empty state initially', () => {
    cy.get('[data-testid="location-list-empty"]').should('be.visible')
    cy.get('[data-testid="location-list-empty-icon"]').should('be.visible')
    cy.get('[data-testid="location-list-empty-title"]').should('contain', 'No locations added')
    cy.get('[data-testid="location-list-empty-description"]').should('be.visible')
  })

  it('should display location list when locations are added', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify location list is displayed
    cy.get('[data-testid="location-list"]').should('be.visible')
    cy.get('[data-testid="location-list-empty"]').should('not.exist')
  })

  it('should show location list title and count', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    cy.get('[data-testid="location-list-title"]').should('contain', 'Selected Locations')
    cy.get('[data-testid="location-list-title-icon"]').should('be.visible')
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
  })

  it('should display location items with proper structure', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Test structure of location items
    cy.get('[data-testid^="location-item-"]').first().within(() => {
      cy.get('[data-testid^="location-item-icon-"]').should('be.visible')
      cy.get('[data-testid^="location-item-name-"]').should('be.visible')
      cy.get('[data-testid^="location-item-address-"]').should('be.visible')
      cy.get('[data-testid^="location-item-coordinates-"]').should('be.visible')
      cy.get('[data-testid^="location-item-remove-"]').should('be.visible')
    })
  })

  it('should allow removing locations', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify location is added
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
    
    // Remove the location
    cy.get('[data-testid^="location-item-remove-"]').first().click()
    
    // After removing all locations, should show empty state
    cy.get('[data-testid="location-list-empty"]').should('be.visible')
  })

  it('should update location count when locations are added/removed', () => {
    // Initial state
    cy.get('[data-testid="location-list-count"]').should('contain', '0')
    
    // Add first location
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Count should update to 1
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
    
    // Add second location
    cy.get('[data-testid="location-search-input"]').type('McDonald\'s New York')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Count should update to 2
    cy.get('[data-testid="location-list-count"]').should('contain', '2')
    
    // Remove one location
    cy.get('[data-testid^="location-item-remove-"]').first().click()
    
    // Count should update back to 1
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
  })

  it('should display location coordinates in proper format', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify coordinate format
    cy.get('[data-testid^="location-item-coordinates-"]').should('contain', ',')
    cy.get('[data-testid^="location-item-coordinates-"]').should('match', /\d+\.\d+, \d+\.\d+/)
  })

  it('should handle hover states on location items', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Test hover effect
    cy.get('[data-testid^="location-item-"]').first().trigger('mouseover')
    // Should have hover styling (this is a visual test)
  })

  it('should be responsive on different screen sizes', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Test on mobile
    cy.viewport(375, 667)
    cy.get('[data-testid="location-list"]').should('be.visible')
    
    // Test on tablet
    cy.viewport(768, 1024)
    cy.get('[data-testid="location-list"]').should('be.visible')
    
    // Test on desktop
    cy.viewport(1280, 720)
    cy.get('[data-testid="location-list"]').should('be.visible')
  })
}) 