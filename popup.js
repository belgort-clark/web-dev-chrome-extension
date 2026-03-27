const html = document.querySelector("#html");
const css = document.querySelector("#css");

html.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    myNewUrl = "https://validator.w3.org/nu/?doc=" + encodeURI(url);
    chrome.tabs.update(tabs[0].id, { url: myNewUrl });
  });
});

css.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    myNewUrl = "https://jigsaw.w3.org/css-validator/validator?uri=" + encodeURI(url) + "&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=en";
    chrome.tabs.update(tabs[0].id, { url: myNewUrl });
  });
});

// Navigation menu functionality
document.addEventListener('DOMContentLoaded', function () {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();

      // Clear search when navigation is clicked
      const searchBox = document.getElementById('searchBox');
      if (searchBox && searchBox.value) {
        searchBox.value = '';
        // Trigger search clear to reset filtered results
        searchBox.dispatchEvent(new Event('input'));
      }

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Expand the section if it's collapsed
        if (targetElement.classList.contains('collapsed')) {
          targetElement.classList.remove('collapsed');
          const wrapper = targetElement.nextElementSibling;
          if (wrapper && wrapper.classList.contains('section-content')) {
            wrapper.classList.remove('collapsed');
          }
          syncAriaExpanded(targetElement);

          // Save the expanded state
          const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
          collapsedSections[targetElement.id] = false;
          localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
        }

        // Smooth scroll to the target section
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Add visual feedback - briefly highlight the clicked nav item
        this.style.backgroundColor = '#004a8a';
        setTimeout(() => {
          this.style.backgroundColor = '';
        }, 200);
      }
    });
  });

  // Collapsible sections - must be set up BEFORE search functionality
  const sectionHeaders = document.querySelectorAll('main h2[id]');

  // Load saved collapse states from localStorage
  const savedStates = JSON.parse(localStorage.getItem('collapsedSections') || '{}');

  // Wrap content after each h2 in a collapsible div
  sectionHeaders.forEach(header => {
    const sectionId = header.id;
    const wrapper = document.createElement('div');
    wrapper.className = 'section-content';

    // Get all elements until the next h2 or end
    let nextElement = header.nextElementSibling;
    const elementsToWrap = [];

    while (nextElement && nextElement.tagName !== 'H2') {
      elementsToWrap.push(nextElement);
      nextElement = nextElement.nextElementSibling;
    }

    // Insert wrapper after header
    header.parentNode.insertBefore(wrapper, header.nextElementSibling);

    // Move elements into wrapper
    elementsToWrap.forEach(el => wrapper.appendChild(el));

    // Always default to collapsed
    header.classList.add('collapsed');
    wrapper.classList.add('collapsed');

    // Make header keyboard accessible
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');

    // Toggle function shared by click and keyboard
    function toggleSection() {
      const isCollapsing = !wrapper.classList.contains('collapsed');

      if (isCollapsing) {
        // Collapsing: set current height first, then collapse
        wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
        // Force reflow
        wrapper.offsetHeight;
        wrapper.classList.add('collapsed');
      } else {
        // Expanding: remove collapsed class and set to scrollHeight
        wrapper.classList.remove('collapsed');
        wrapper.style.maxHeight = wrapper.scrollHeight + 'px';

        // After animation, remove inline max-height for flexibility
        setTimeout(() => {
          if (!wrapper.classList.contains('collapsed')) {
            wrapper.style.maxHeight = 'none';
          }
        }, 400);
      }

      header.classList.toggle('collapsed');
      header.setAttribute('aria-expanded', !isCollapsing);

      // Save state
      const collapsedSections = {};
      sectionHeaders.forEach(h => {
        if (h.classList.contains('collapsed')) {
          collapsedSections[h.id] = true;
        } else {
          collapsedSections[h.id] = false;
        }
      });
      localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    }

    // Add click handler
    header.addEventListener('click', toggleSection);

    // Add keyboard handler for Enter and Space
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSection();
      }
    });
  });

  // Search functionality - must be set up AFTER sections are wrapped
  const searchBox = document.getElementById('searchBox');
  const clearButton = document.getElementById('clearSearch');
  const noResults = document.getElementById('noResults');
  const sections = document.querySelectorAll('main h2[id]');

  // Helper to sync aria-expanded with collapsed state
  function syncAriaExpanded(header) {
    header.setAttribute('aria-expanded', !header.classList.contains('collapsed'));
  }

  function performSearch() {
    const searchTerm = searchBox.value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearch');

    // Show/hide clear button using visibility
    if (searchTerm) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');

      // Collapse all sections when search is cleared
      sections.forEach(section => {
        const wrapper = section.nextElementSibling;
        if (wrapper && wrapper.classList.contains('section-content')) {
          section.classList.add('collapsed');
          wrapper.classList.add('collapsed');
          syncAriaExpanded(section);
        }
      });
    }

    let hasResults = false;

    // Handle validation buttons separately
    const validationButtons = document.querySelectorAll('#html, #css');
    const validationSection = document.getElementById('validation');

    sections.forEach(section => {
      const sectionId = section.id;
      // Look for the wrapper div that contains the content
      const wrapper = section.nextElementSibling;
      if (!wrapper || !wrapper.classList.contains('section-content')) {
        return;
      }

      const nextElement = wrapper.firstElementChild;

      // Special handling for validation section
      if (sectionId === 'validation') {
        const list = wrapper.querySelector('ul');
        if (list) {
          const items = list.querySelectorAll('li');
          let sectionHasMatch = false;

          items.forEach(item => {
            const linkText = item.textContent.toLowerCase();
            const link = item.querySelector('a');

            if (!searchTerm) {
              item.style.display = '';
              section.classList.remove('hidden-section');
              wrapper.classList.remove('hidden-section');
              list.style.display = '';
              sectionHasMatch = true;
              if (link) link.innerHTML = link.textContent;
            } else if (linkText.includes(searchTerm) || sectionId.includes(searchTerm)) {
              item.style.display = '';
              sectionHasMatch = true;
              if (link && linkText.includes(searchTerm)) {
                const originalText = link.textContent;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                link.innerHTML = originalText.replace(regex, '<span class="highlight">$1</span>');
              }
            } else {
              item.style.display = 'none';
              if (link) link.innerHTML = link.textContent;
            }
          });

          // Show/hide validation section and buttons
          if (sectionHasMatch || !searchTerm) {
            section.classList.remove('hidden-section');
            wrapper.classList.remove('hidden-section');
            list.style.display = '';
            validationButtons.forEach(btn => btn.style.display = 'block');
            hasResults = true;

            // Expand the section to show search results
            if (searchTerm) {
              section.classList.remove('collapsed');
              wrapper.classList.remove('collapsed');
              wrapper.style.maxHeight = 'none';
              syncAriaExpanded(section);
            }
          } else {
            section.classList.add('hidden-section');
            wrapper.classList.add('hidden-section');
            list.style.display = 'none';
            validationButtons.forEach(btn => btn.style.display = 'none');
          }
        }
        return; // Skip the rest of the loop for validation section
      }

      // Find the associated list (ul) in the wrapper
      const list = wrapper.querySelector('ul');
      if (list) {
        const items = list.querySelectorAll('li');
        let sectionHasMatch = false;

        items.forEach(item => {
          // Get the text content of the link
          const linkText = item.textContent.toLowerCase();
          const link = item.querySelector('a');

          if (!searchTerm) {
            // No search term - show everything
            item.style.display = '';
            section.classList.remove('hidden-section');
            wrapper.classList.remove('hidden-section');
            list.style.display = '';
            sectionHasMatch = true;

            // Remove any highlights
            if (link) {
              link.innerHTML = link.textContent;
            }
          } else if (linkText.includes(searchTerm) || sectionId.includes(searchTerm)) {
            // Match found - show item
            item.style.display = '';
            sectionHasMatch = true;

            // Highlight matching text
            if (link && linkText.includes(searchTerm)) {
              const originalText = link.textContent;
              const regex = new RegExp(`(${searchTerm})`, 'gi');
              link.innerHTML = originalText.replace(regex, '<span class="highlight">$1</span>');
            }
          } else {
            // No match - hide item
            item.style.display = 'none';

            // Remove highlights
            if (link) {
              link.innerHTML = link.textContent;
            }
          }
        });

        // Show/hide section based on matches
        if (sectionHasMatch) {
          section.classList.remove('hidden-section');
          wrapper.classList.remove('hidden-section');
          list.style.display = '';
          hasResults = true;

          // Expand the section to show search results
          if (searchTerm) {
            section.classList.remove('collapsed');
            wrapper.classList.remove('collapsed');
            wrapper.style.maxHeight = 'none';
            syncAriaExpanded(section);
          }
        } else {
          section.classList.add('hidden-section');
          wrapper.classList.add('hidden-section');
          list.style.display = 'none';
        }
      } else {
        // Handle sections without lists
        if (!searchTerm) {
          section.classList.remove('hidden-section');
          wrapper.classList.remove('hidden-section');
          hasResults = true;
        } else {
          const sectionText = wrapper.textContent.toLowerCase();
          if (sectionText.includes(searchTerm) || sectionId.includes(searchTerm)) {
            section.classList.remove('hidden-section');
            wrapper.classList.remove('hidden-section');
            hasResults = true;

            // Expand the section to show search results
            section.classList.remove('collapsed');
            wrapper.classList.remove('collapsed');
            wrapper.style.maxHeight = 'none';
            syncAriaExpanded(section);
          } else {
            section.classList.add('hidden-section');
            wrapper.classList.add('hidden-section');
          }
        }
      }
    });

    // Show/hide no results message
    if (searchTerm && !hasResults) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
  }

  // Event listeners for search
  searchBox.addEventListener('input', performSearch);

  clearButton.addEventListener('click', function () {
    searchBox.value = '';
    performSearch();
    searchBox.focus();
  });

  // Keyboard shortcut: "/" to focus search
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchBox) {
      e.preventDefault();
      searchBox.focus();
    }
    // ESC to clear search
    if (e.key === 'Escape' && document.activeElement === searchBox) {
      searchBox.value = '';
      performSearch();
    }
  });

  // Easter egg: click logo 5 times for a spin + confetti
  const logoBtn = document.querySelector('.logo-btn');
  const logoIcon = logoBtn.querySelector('.logo-icon');
  let clickCount = 0;
  let clickTimer = null;

  logoBtn.addEventListener('click', function () {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1000);

    if (clickCount >= 5) {
      clickCount = 0;
      logoIcon.classList.add('spin');
      launchConfetti();
      logoIcon.addEventListener('animationend', function () {
        logoIcon.classList.remove('spin');
      }, { once: true });
    }
  });

  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#002855', '#e8b931', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.width = (Math.random() * 8 + 5) + 'px';
      piece.style.height = (Math.random() * 8 + 5) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 2500);
  }

  // Add screen reader text to links that open in new tabs
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const srSpan = document.createElement('span');
    srSpan.className = 'sr-only';
    srSpan.textContent = ' (opens in new tab)';
    link.appendChild(srSpan);
  });
});
