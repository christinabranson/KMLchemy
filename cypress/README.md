# KMLchemy Cypress Tests

This directory contains comprehensive E2E tests for the KMLchemy application using Cypress.

## Test Structure

### Test Files

- **`app.cy.ts`** - Main application tests covering overall app structure and layout
- **`location-search.cy.ts`** - Location search functionality tests
- **`location-list.cy.ts`** - Location list management tests
- **`bulk-import.cy.ts`** - Bulk import functionality tests
- **`export-section.cy.ts`** - Export functionality tests
- **`integration.cy.ts`** - Complete workflow integration tests

### Support Files

- **`cypress.config.ts`** - Cypress configuration
- **`support/e2e.ts`** - Global test setup and configuration with API mocking
- **`support/commands.ts`** - Custom Cypress commands (currently disabled due to TypeScript issues)

### Mock Fixtures

- **`fixtures/mapbox-search-success.json`** - Mock successful Mapbox search results
- **`fixtures/mapbox-search-no-results.json`** - Mock empty search results
- **`fixtures/mapbox-search-error.json`** - Mock API error responses

## Running Tests

### Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Make sure the app is running on `http://localhost:3000`

### Running Tests

#### Open Cypress Test Runner (Interactive)
```bash
npm run cypress:open
```

#### Run Tests Headlessly
```bash
npm run cypress:run
```

#### Run Specific Test Files
```bash
# Run only app tests
npx cypress run --spec "cypress/e2e/app.cy.ts"

# Run only location search tests
npx cypress run --spec "cypress/e2e/location-search.cy.ts"

# Run only integration tests
npx cypress run --spec "cypress/e2e/integration.cy.ts"
```

## API Mocking

The tests use comprehensive API mocking to avoid requiring a real Mapbox token:

### Mock Configuration

All Mapbox API calls are intercepted and mocked in `cypress/support/e2e.ts`:

```typescript
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
```

### Mock Responses

#### Successful Search Results (`mapbox-search-success.json`)
- Returns 3 mock locations: 2 Starbucks locations and 1 McDonald's
- Includes proper coordinates, place names, and categories
- Simulates realistic Mapbox API response structure

#### No Results (`mapbox-search-no-results.json`)
- Returns empty feature collection
- Used for invalid search terms

#### Error Response (`mapbox-search-error.json`)
- Returns 401 unauthorized error
- Used for missing token scenarios

### Using Mocks in Tests

Tests wait for the mocked API calls using:
```typescript
cy.wait('@mapboxSearch')
```

This ensures the mock response is returned before proceeding with assertions.

## Test Coverage

### App Tests (`app.cy.ts`)
- ✅ App header and title display
- ✅ Main content sections visibility
- ✅ Footer with Mapbox API link
- ✅ Setup alert when no Mapbox token
- ✅ Empty location list state
- ✅ Export section with disabled button

### Location Search Tests (`location-search.cy.ts`)
- ✅ Search form display and functionality
- ✅ Input placeholder and validation
- ✅ Search button states (disabled/enabled)
- ✅ Loading states during search
- ✅ Search results dropdown with mocked data
- ✅ No results handling
- ✅ Form submission
- ✅ Error handling for missing Mapbox token
- ✅ Search result structure
- ✅ Dropdown close behavior
- ✅ Location addition from search results

### Location List Tests (`location-list.cy.ts`)
- ✅ Empty state display
- ✅ Location list when items are added
- ✅ Title and count display
- ✅ Location item structure
- ✅ Location removal functionality
- ✅ Count updates
- ✅ Coordinate format validation
- ✅ Hover states
- ✅ Responsive design

### Bulk Import Tests (`bulk-import.cy.ts`)
- ✅ Bulk import section display
- ✅ Textarea functionality
- ✅ Example data population
- ✅ Button states
- ✅ Clear functionality
- ✅ Progress indicators
- ✅ Results display
- ✅ Success/error counts
- ✅ Individual result items
- ✅ Success alerts
- ✅ Error handling
- ✅ CSV format handling
- ✅ Mixed format handling
- ✅ Textarea disable during processing
- ✅ Location list integration

### Export Section Tests (`export-section.cy.ts`)
- ✅ Export section display
- ✅ Description text
- ✅ Button states (disabled when no locations)
- ✅ Success alerts
- ✅ Error alerts
- ✅ Button click handling
- ✅ Location count display
- ✅ Transforming state
- ✅ Responsive design
- ✅ Button styling
- ✅ Download icon

### Integration Tests (`integration.cy.ts`)
- ✅ Complete workflow: search, add, export
- ✅ Bulk import workflow
- ✅ Location removal workflow
- ✅ Multiple locations workflow
- ✅ No results handling
- ✅ Mixed results handling
- ✅ State persistence
- ✅ Responsive layout
- ✅ Complex search scenarios

## Test Data

The tests use realistic test data including:
- Business names: "Starbucks Philadelphia", "McDonald's New York"
- Addresses: "123 Main St, Philadelphia, PA", "456 Market St, New York, NY"
- Landmarks: "Central Park, New York, NY", "Golden Gate Bridge, San Francisco, CA"

## Mock Benefits

### Advantages of Mocking
1. **No API Token Required**: Tests run without needing a real Mapbox token
2. **Consistent Results**: Mock responses are predictable and stable
3. **Fast Execution**: No network delays or API rate limits
4. **Reliable Testing**: Tests don't fail due to API availability issues
5. **Cost Effective**: No API usage costs during testing

### Mock Coverage
- ✅ Successful search results
- ✅ No results scenarios
- ✅ API error handling
- ✅ Different search query types
- ✅ Realistic response structure

## Notes

### Test Stability
- Tests include appropriate waits for loading states
- Dropdown interactions are tested with proper visibility checks
- Error states are handled gracefully
- Responsive design is tested across multiple viewport sizes
- API calls are properly mocked and waited for

### Custom Commands
The `commands.ts` file contains custom Cypress commands for common operations, but they are currently disabled due to TypeScript configuration issues. The commands can be re-enabled once the TypeScript setup is properly configured.

## Future Enhancements

1. **Visual Regression Testing**: Add visual comparison tests
2. **Performance Testing**: Add tests for search response times
3. **Accessibility Testing**: Add a11y compliance tests
4. **Cross-browser Testing**: Extend tests to multiple browsers
5. **Mobile Testing**: Add specific mobile interaction tests
6. **Enhanced Mocking**: Add more varied mock responses for edge cases

## Troubleshooting

### Common Issues

1. **Tests failing due to missing Mapbox token**: This is expected behavior. Tests are designed to handle the no-token scenario.

2. **Search results not appearing**: Tests may fail if Mapbox API is unavailable. The mocking should prevent this.

3. **Timing issues**: Some tests may need longer timeouts for slower environments. Adjust `defaultCommandTimeout` in `cypress.config.ts`.

4. **TypeScript errors**: The custom commands file has TypeScript issues. Use the direct test selectors instead.

5. **Mock not working**: Ensure the intercept is properly configured in `support/e2e.ts`.

### Debugging

- Use `cy.debug()` to pause execution at specific points
- Use `cy.pause()` to step through tests
- Check browser console for JavaScript errors
- Use `cy.screenshot()` to capture test failures
- Check network tab to verify API calls are being intercepted 