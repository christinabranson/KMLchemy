describe('KMLchemy App', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the app header and title', () => {
    cy.get('[data-testid="app-header"]').should('be.visible')
    cy.get('[data-testid="app-title"]').should('contain', 'KMLchemy')
    cy.get('[data-testid="app-logo"]').should('be.visible')
    cy.get('[data-testid="app-description"]').should('be.visible')
  })

  it('should display the main content sections', () => {
    cy.get('[data-testid="main-content"]').should('be.visible')
    cy.get('[data-testid="search-section"]').should('be.visible')
    cy.get('[data-testid="individual-search-container"]').should('be.visible')
    cy.get('[data-testid="bulk-import-container"]').should('be.visible')
    cy.get('[data-testid="results-section"]').should('be.visible')
    cy.get('[data-testid="location-list-container"]').should('be.visible')
    cy.get('[data-testid="export-section-container"]').should('be.visible')
  })

  it('should display the footer with Mapbox API link', () => {
    cy.get('[data-testid="app-footer"]').should('be.visible')
    cy.get('[data-testid="footer-text"]').should('contain', 'Powered by')
    cy.get('[data-testid="mapbox-api-link"]').should('be.visible')
    cy.get('[data-testid="mapbox-api-link"]').should('have.attr', 'href', 'https://docs.mapbox.com/api/search/geocoding/')
  })

  it('should show setup alert when no Mapbox token is configured', () => {
    // This test assumes no token is configured in the test environment
    cy.get('[data-testid="setup-alert"]').should('be.visible')
    cy.get('[data-testid="setup-alert-description"]').should('contain', 'Setup Required')
  })

  it('should display empty location list initially', () => {
    cy.get('[data-testid="location-list-empty"]').should('be.visible')
    cy.get('[data-testid="location-list-empty-title"]').should('contain', 'No locations added')
    cy.get('[data-testid="location-list-empty-description"]').should('be.visible')
  })

  it('should display export section with disabled button when no locations', () => {
    cy.get('[data-testid="export-section"]').should('be.visible')
    cy.get('[data-testid="export-section-title"]').should('contain', 'Export to KML')
    cy.get('[data-testid="export-button"]').should('be.disabled')
    cy.get('[data-testid="export-no-locations-message"]').should('be.visible')
  })
}) 