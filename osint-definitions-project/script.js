document.addEventListener('DOMContentLoaded', () => {
    const definitionList = document.getElementById('definition-list'); // Main list container
    const definitionCount = document.getElementById('definition-count'); // Total count
    const searchBar = document.getElementById('search-bar'); // Search bar input
    const categoryFilters = document.querySelectorAll('.category-filter'); // All category checkboxes
    const minYearInput = document.getElementById('min-year'); // Minimum year
    const maxYearInput = document.getElementById('max-year'); // Maximum year
    const toggleButton = document.getElementById('toggle-filters'); // Toggle button for filters
    const filters = document.getElementById('filters'); // Filters container

    fetch('./data/definitions.json') // Fetch the JSON file
        .then(response => response.json())
        .then(data => {
            let definitions = data; // Store definitions from JSON

            // Function to render definitions based on filters
            function renderDefinitions() {
                const searchTerm = searchBar.value.toLowerCase(); // Get search term
                const activeCategories = Array.from(categoryFilters)
                    .filter(checkbox => checkbox.checked) // Get checked categories
                    .map(checkbox => checkbox.value);
                const minYear = parseInt(minYearInput.value) || 0; // Default to 0 if empty
                const maxYear = parseInt(maxYearInput.value) || new Date().getFullYear(); // Default to current year if empty

                // Filter definitions by search term, category, and year
                const filteredDefinitions = definitions.filter(def => {
                    const matchesSearch = def.Definition.toLowerCase().includes(searchTerm);
                    const matchesCategory = activeCategories.length === 0 || activeCategories.includes(def.Category);
                    const matchesYear = def.Year >= minYear && def.Year <= maxYear;
                    return matchesSearch && matchesCategory && matchesYear;
                });

                // Update total count and clear the list
                definitionCount.textContent = filteredDefinitions.length;
                definitionList.innerHTML = '';

                // Add filtered definitions to the list
                filteredDefinitions.forEach(def => {
                    const definitionElement = document.createElement('div');
                    definitionElement.className = 'definition';

                    // Include the Author/Organisation prominently
                    const author = document.createElement('h4');
                    author.textContent = `${def['Author'] || 'Author Unknown'} (${def.Year || 'N.D.'})`;

                    const text = document.createElement('p');
                    text.innerHTML = highlightSearchTerm(def.Definition, searchTerm);

                    const details = document.createElement('div');
                    details.className = 'definition-details';
                    details.style.display = 'none'; // Initially hidden

                    details.innerHTML = `
                        <p><strong>Source:</strong> ${def.Source}</p>
                        <p><strong>Category:</strong> ${def.Category}</p>
                        <p><strong>Notes:</strong> ${def.Notes || 'None'}</p>
                    `;

                    // Add an expand/collapse button
                    const toggleButton = document.createElement('button');
                    toggleButton.className = 'toggle-button';
                    toggleButton.textContent = '▼';
                    toggleButton.setAttribute('aria-expanded', 'false');

                    toggleButton.addEventListener('click', () => {
                        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
                        details.style.display = isExpanded ? 'none' : 'block';
                        toggleButton.textContent = isExpanded ? '▼' : '▲';
                        toggleButton.setAttribute('aria-expanded', !isExpanded);
                    });

                    definitionElement.appendChild(author);
                    definitionElement.appendChild(text);
                    definitionElement.appendChild(toggleButton);
                    definitionElement.appendChild(details);

                    definitionList.appendChild(definitionElement);
                });
            }

            // Highlight matching search term in definitions
            function highlightSearchTerm(text, term) {
                if (!term) return text; // If no search term, return unmodified text
                const regex = new RegExp(`(${term})`, 'gi'); // Create a case-insensitive regex
                return text.replace(regex, '<span class="highlight">$1</span>');
            }

            // Event listeners for search and category filters
            searchBar.addEventListener('input', renderDefinitions); // Trigger on typing
            categoryFilters.forEach(checkbox => checkbox.addEventListener('change', renderDefinitions)); // Trigger on toggle
            minYearInput.addEventListener('input', renderDefinitions); // Minimum year
            maxYearInput.addEventListener('input', renderDefinitions); // Maximum year

            // Event listener for filter toggle button
            toggleButton.addEventListener('click', () => {
                const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
                toggleButton.setAttribute('aria-expanded', !isExpanded);
                filters.classList.toggle('collapsed', !isExpanded);
            });

            renderDefinitions(); // Initial render
        })
        .catch(err => console.error('Error loading JSON:', err));
});
