describe('Location Search', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display location search form', () => {
    cy.get('[data-testid="location-search-container"]').should('be.visible')
    cy.get('[data-testid="location-search-form"]').should('be.visible')
    cy.get('[data-testid="location-search-input"]').should('be.visible')
    cy.get('[data-testid="location-search-button"]').should('be.visible')
    cy.get('[data-testid="location-search-icon"]').should('be.visible')
  })

  it('should show search input placeholder text', () => {
    cy.get('[data-testid="location-search-input"]')
      .should('have.attr', 'placeholder')
      .and('include', 'Search businesses')
  })

  it('should have search button disabled initially', () => {
    cy.get('[data-testid="location-search-button"]').should('be.disabled')
  })

  it('should enable search button when typing', () => {
    cy.get('[data-testid="location-search-input"]').type('Starbucks')
    cy.get('[data-testid="location-search-button"]').should('not.be.disabled')
  })

  it('should show loading state during search', () => {
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    cy.get('[data-testid="location-search-loading"]').should('be.visible')
  })

  it('should display search results dropdown with mocked data', () => {
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Wait for the API call to be intercepted
    cy.wait('@mapboxSearch')
    
    // Wait for loading to complete
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    
    // Check if dropdown appears with mocked results
    cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
    cy.get('[data-testid^="location-search-result-"]').should('have.length', 3)
  })

  it('should show no results message when search fails', () => {
    cy.get('[data-testid="location-search-input"]').type('InvalidSearchTerm12345')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Wait for the API call to be intercepted
    cy.wait('@mapboxSearch')
    
    // Wait for loading to complete
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    
    // Check for no results message
    cy.get('[data-testid="location-search-no-results"]').should('be.visible')
    cy.get('[data-testid="location-search-no-results-message"]').should('contain', 'No results found')
  })

  it('should handle form submission', () => {
    cy.get('[data-testid="location-search-form"]').within(() => {
      cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia{enter}')
    })
    
    // Should trigger search on form submission
    cy.get('[data-testid="location-search-loading"]').should('be.visible')
  })

  it('should show error alert when Mapbox token is missing', () => {
    // This test assumes no token is configured
    cy.get('[data-testid="location-search-no-token-alert"]').should('be.visible')
    cy.get('[data-testid="location-search-no-token-message"]').should('contain', 'Mapbox token is not configured')
  })

  it('should display search result items with proper structure', () => {
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Wait for the API call to be intercepted
    cy.wait('@mapboxSearch')
    
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
    
    // Check structure of search results
    cy.get('[data-testid^="location-search-result-"]').first().within(() => {
      cy.get('[data-testid^="location-search-result-name-"]').should('be.visible')
      cy.get('[data-testid^="location-search-result-address-"]').should('be.visible')
      cy.get('[data-testid^="location-search-result-type-"]').should('be.visible')
    })
  })

  it('should close dropdown when clicking outside', () => {
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Wait for the API call to be intercepted
    cy.wait('@mapboxSearch')
    
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
    
    // Click outside the dropdown
    cy.get('[data-testid="app-header"]').click()
    cy.get('[data-testid="location-search-dropdown"]').should('not.exist')
  })

  it('should add location when clicking on search result', () => {
    cy.get('[data-testid="location-search-input"]').type('Starbucks Philadelphia')
    cy.get('[data-testid="location-search-button"]').click()
    
    // Wait for the API call to be intercepted
    cy.wait('@mapboxSearch')
    
    cy.get('[data-testid="location-search-loading"]').should('not.exist')
    cy.get('[data-testid="location-search-dropdown"]').should('be.visible')
    
    // Click on first search result
    cy.get('[data-testid^="location-search-result-"]').first().click()
    
    // Verify dropdown closes and location is added
    cy.get('[data-testid="location-search-dropdown"]').should('not.exist')
    cy.get('[data-testid="location-list"]').should('be.visible')
    cy.get('[data-testid="location-list-count"]').should('contain', '1')
  })
}) 