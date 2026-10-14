(function () {
  const filters = document.querySelector('[data-filters]');
  const filtersToggle = document.querySelector('[data-filters-toggle]');
  const searchInput = document.querySelector('[data-product-search]');
  const clearFilters = document.querySelector('[data-filters-clear]');
  const applyFilters = document.querySelector('[data-filters-apply]');
  const sortSelect = document.querySelector('#sort');
  const resultsCount = document.querySelector('[data-results-count]');
  const emptyState = document.querySelector('[data-empty-state]');
  const productGrid = document.querySelector('.product-grid');
  const productCards = productGrid
    ? Array.from(productGrid.querySelectorAll('.product-card'))
    : [];
  const filterInputs = filters
    ? Array.from(filters.querySelectorAll('input[data-filter]'))
    : [];

  // Mobile filters toggle (sidebar becomes a collapsible panel under 980px)
  function syncFiltersToggle() {
    if (!filtersToggle || !filters) return;

    if (window.innerWidth <= 980) {
      filtersToggle.style.display = 'inline-flex';
    } else {
      filtersToggle.style.display = 'none';
      filters.classList.remove('is-open');
      filtersToggle.setAttribute('aria-expanded', 'false');
    }
  }
  if (filtersToggle && filters) {
    filtersToggle.setAttribute('aria-expanded', 'false');
    filtersToggle.addEventListener('click', () => {
      const isOpen = filters.classList.toggle('is-open');
      filtersToggle.setAttribute('aria-expanded', String(isOpen));
    });
    window.addEventListener('resize', syncFiltersToggle);
    syncFiltersToggle();
  }

  function selectedValues(group) {
    return filterInputs
      .filter((input) => input.dataset.filter === group && input.checked)
      .map((input) => input.value.toLocaleLowerCase());
  }

  function renderProducts() {
    const searchTerm = searchInput ? searchInput.value.trim().toLocaleLowerCase() : '';
    const categories = selectedValues('category');
    const pharmacies = selectedValues('pharmacy');
    let visibleCount = 0;

    productCards.forEach((card) => {
      const matchesSearch = (card.dataset.search || '').toLocaleLowerCase().includes(searchTerm);
      const category = (card.querySelector('.product-card__category')?.textContent || '').trim().toLocaleLowerCase();
      const pharmacy = (card.querySelector('.product-card__pharmacy')?.textContent || '').trim().toLocaleLowerCase();
      const matchesCategory = categories.length === 0 || categories.includes(category);
      const matchesPharmacy = pharmacies.length === 0 || pharmacies.includes(pharmacy);
      const isVisible = matchesSearch && matchesCategory && matchesPharmacy;

      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (resultsCount) resultsCount.textContent = String(visibleCount);
    if (emptyState) emptyState.hidden = visibleCount > 0;

    if (productGrid && sortSelect) {
      const sortBy = sortSelect.value;
      const sortedCards = [...productCards].sort((first, second) => {
        if (sortBy === 'price-asc') {
          return Number(first.dataset.price) - Number(second.dataset.price);
        }
        if (sortBy === 'price-desc') {
          return Number(second.dataset.price) - Number(first.dataset.price);
        }
        return Number(second.dataset.productId) - Number(first.dataset.productId);
      });
      productGrid.append(...sortedCards);
      if (emptyState) productGrid.append(emptyState);
    }
  }

  filterInputs.forEach((input) => input.addEventListener('change', renderProducts));
  if (searchInput) searchInput.addEventListener('input', renderProducts);
  if (sortSelect) sortSelect.addEventListener('change', renderProducts);
  if (applyFilters) applyFilters.addEventListener('click', renderProducts);
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      filterInputs.forEach((input) => {
        input.checked = false;
      });
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'latest';
      renderProducts();
    });
  }
  renderProducts();

  // Add product to the database-backed shopping cart.
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-add-to-cart]");

    if (!button || button.disabled) return;

    const productID = button.dataset.productId;
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Adding...";

    try {
        const response = await fetch("/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                productID: productID,
                quantity: "1"
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to add product.");
        }

        window.pmUpdateCartBadge(result.cartItemCount);
        if (window.pmToast) {
            window.pmToast(result.message);
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error(error);
        alert(error.message || "Something went wrong.");
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
});

})();
