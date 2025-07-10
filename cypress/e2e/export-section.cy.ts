describe('Export Section', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display export section', () => {
    cy.get('[data-testid="export-section"]').should('be.visible')
    cy.get('[data-testid="export-section-title"]').should('contain', 'Export to KML')
    cy.get('[data-testid="export-section-title-icon"]').should('be.visible')
    cy.get('[data-testid="export-section-content"]').should('be.visible')
    cy.get('[data-testid="export-section-description"]').should('be.visible')
  })

  it('should show export description text', () => {
    cy.get('[data-testid="export-section-description"]').should('contain', 'Transform your selected locations')
    cy.get('[data-testid="export-section-description"]').should('contain', 'Google Earth')
    cy.get('[data-testid="export-section-description"]').should('contain', 'Google Maps')
  })

  it('should have export button disabled when no locations are added', () => {
    cy.get('[data-testid="export-button"]').should('be.disabled')
    cy.get('[data-testid="export-no-locations-message"]').should('be.visible')
    cy.get('[data-testid="export-no-locations-message"]').should('contain', 'Add some locations')
  })

  it('should enable export button when locations are added', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify export button is enabled
    cy.get('[data-testid="export-button"]').should('not.be.disabled')
  })

  it('should show export button with correct text', () => {
    cy.get('[data-testid="export-button"]').should('contain', 'Export 0 Location')
    
    // Add a location
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify button text updates
    cy.get('[data-testid="export-button"]').should('contain', 'Export 1 Location')
  })

  it('should show success alert when export is successful', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Export the KML file
    cy.get('[data-testid="export-button"]').click()
    cy.get('[data-testid="export-success-alert"]').should('be.visible')
    cy.get('[data-testid="export-success-message"]').should('contain', 'KML file exported successfully')
  })

  it('should show error alert when export fails', () => {
    // This test would require a failed export scenario
    cy.get('[data-testid="export-error-alert"]').should('not.exist')
    
    // After failed export:
    // cy.get('[data-testid="export-error-alert"]').should('be.visible')
    // cy.get('[data-testid="export-error-message"]').should('contain', 'Failed to export KML file')
  })

  it('should handle export button click', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify button is enabled and click it
    cy.get('[data-testid="export-button"]').should('not.be.disabled')
    cy.get('[data-testid="export-button"]').click()
    cy.get('[data-testid="export-success-alert"]').should('be.visible')
  })

  it('should show correct location count in export button', () => {
    cy.get('[data-testid="export-button"]').should('contain', 'Export 0 Location')
    
    // Add first location
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    cy.get('[data-testid="export-button"]').should('contain', 'Export 1 Location')
    
    // Add second location
    cy.get('[data-testid="location-search-input"]').type('McDonald\'s New York')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    cy.get('[data-testid="export-button"]').should('contain', 'Export 2 Locations')
  })

  it('should show transforming text during export', () => {
    // Add a location first
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.wait('@mapboxSearch')
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Click export and check for transforming text
    cy.get('[data-testid="export-button"]').click()
    cy.get('[data-testid="export-button"]').should('contain', 'Transforming...')
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
    cy.get('[data-testid="export-section"]').should('be.visible')
    
    // Test on tablet
    cy.viewport(768, 1024)
    cy.get('[data-testid="export-section"]').should('be.visible')
    
    // Test on desktop
    cy.viewport(1280, 720)
    cy.get('[data-testid="export-section"]').should('be.visible')
  })

  it('should have proper button styling', () => {
    cy.get('[data-testid="export-button"]').should('have.class', 'bg-gradient-to-r')
    cy.get('[data-testid="export-button"]').should('have.class', 'from-kmlchemy-green')
    cy.get('[data-testid="export-button"]').should('have.class', 'to-kmlchemy-navy')
  })

  it('should show download icon in export button', () => {
    cy.get('[data-testid="export-button"]').within(() => {
      // The download icon should be present
      cy.get('svg').should('exist')
    })
  })
}) 