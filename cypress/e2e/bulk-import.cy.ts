describe('Bulk Import', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display bulk import section', () => {
    cy.get('[data-testid="bulk-import"]').should('be.visible')
    cy.get('[data-testid="bulk-import-title"]').should('contain', 'Bulk Import Addresses')
    cy.get('[data-testid="bulk-import-title-icon"]').should('be.visible')
    cy.get('[data-testid="bulk-import-content"]').should('be.visible')
    cy.get('[data-testid="bulk-import-description"]').should('be.visible')
  })

  it('should display textarea for addresses', () => {
    cy.get('[data-testid="bulk-import-textarea"]').should('be.visible')
    cy.get('[data-testid="bulk-import-textarea"]')
      .should('have.attr', 'placeholder')
      .and('include', 'Paste your addresses here')
  })

  it('should show label and use example button', () => {
    cy.get('[data-testid="bulk-import-label"]').should('contain', 'Addresses to Import')
    cy.get('[data-testid="bulk-import-use-example-button"]').should('be.visible')
    cy.get('[data-testid="bulk-import-use-example-button"]').should('contain', 'Use Example')
  })

  it('should populate textarea with example data when use example button is clicked', () => {
    cy.get('[data-testid="bulk-import-use-example-button"]').click()
    cy.get('[data-testid="bulk-import-textarea"]').should('not.have.value', '')
    cy.get('[data-testid="bulk-import-textarea"]').should('contain.value', 'Starbucks')
  })

  it('should have import button disabled initially', () => {
    cy.get('[data-testid="bulk-import-button"]').should('be.disabled')
  })

  it('should enable import button when text is entered', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA')
    cy.get('[data-testid="bulk-import-button"]').should('not.be.disabled')
  })

  it('should show clear button when text is entered', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Some address')
    cy.get('[data-testid="bulk-import-clear-button"]').should('be.visible')
  })

  it('should clear textarea when clear button is clicked', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Some address')
    cy.get('[data-testid="bulk-import-clear-button"]').click()
    cy.get('[data-testid="bulk-import-textarea"]').should('have.value', '')
  })

  it('should show progress indicator during processing', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA\nMcDonald\'s, New York, NY')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    cy.get('[data-testid="bulk-import-progress"]').should('be.visible')
    cy.get('[data-testid="bulk-import-progress-text"]').should('contain', 'Processing addresses')
    cy.get('[data-testid="bulk-import-progress-bar"]').should('be.visible')
    cy.get('[data-testid="bulk-import-progress-fill"]').should('be.visible')
    cy.get('[data-testid="bulk-import-progress-percentage"]').should('be.visible')
  })

  it('should display results after processing', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA\nMcDonald\'s, New York, NY')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Wait for processing to complete
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    cy.get('[data-testid="bulk-import-results"]').should('be.visible')
    cy.get('[data-testid="bulk-import-results-list"]').should('be.visible')
  })

  it('should show success and error counts', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA\nInvalid Address 12345')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Wait for processing to complete
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    cy.get('[data-testid="bulk-import-success-count"]').should('be.visible')
    cy.get('[data-testid="bulk-import-error-count"]').should('be.visible')
  })

  it('should display individual result items', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Wait for processing to complete
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    cy.get('[data-testid="bulk-import-results-list"]').within(() => {
      cy.get('[data-testid="bulk-import-result-0"]').should('be.visible')
      cy.get('[data-testid="bulk-import-result-original-0"]').should('be.visible')
    })
  })

  it('should show success alert when processing completes successfully', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Wait for processing to complete
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    cy.get('[data-testid="bulk-import-success-alert"]').should('be.visible')
    cy.get('[data-testid="bulk-import-success-message"]').should('contain', 'Successfully imported')
  })

  it('should show error alert when Mapbox token is missing', () => {
    // This test assumes no token is configured
    cy.get('[data-testid="bulk-import-no-token-alert"]').should('be.visible')
    cy.get('[data-testid="bulk-import-no-token-message"]').should('contain', 'Mapbox token is required')
  })

  it('should handle CSV format addresses', () => {
    const csvData = '"Starbucks", "123 Main St, Philadelphia, PA"\n"McDonald\'s", "456 Market St, New York, NY"'
    cy.get('[data-testid="bulk-import-textarea"]').type(csvData)
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Should process CSV format correctly
    cy.get('[data-testid="bulk-import-progress"]').should('be.visible')
  })

  it('should handle mixed format addresses', () => {
    const mixedData = 'Starbucks, Philadelphia, PA\n"McDonald\'s", "456 Market St, New York, NY"\nCentral Park, New York'
    cy.get('[data-testid="bulk-import-textarea"]').type(mixedData)
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Should process mixed formats correctly
    cy.get('[data-testid="bulk-import-progress"]').should('be.visible')
  })

  it('should disable textarea during processing', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    cy.get('[data-testid="bulk-import-textarea"]').should('be.disabled')
    
    // Wait for processing to complete
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    cy.get('[data-testid="bulk-import-textarea"]').should('not.be.disabled')
  })

  it('should add locations to the location list after successful import', () => {
    cy.get('[data-testid="bulk-import-textarea"]').type('Starbucks, Philadelphia, PA\nMcDonald\'s, New York, NY')
    cy.get('[data-testid="bulk-import-button"]').click()
    
    // Wait for processing to complete
    cy.get('[data-testid="bulk-import-progress"]').should('not.exist')
    
    // Verify locations were added to the list
    cy.get('[data-testid="location-list"]').should('be.visible')
    cy.get('[data-testid="location-list-count"]').should('not.contain', '0')
  })
}) 