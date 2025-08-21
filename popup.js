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
document.addEventListener('DOMContentLoaded', function() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
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
});
