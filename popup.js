const html = document.querySelector("#html")
const css = document.querySelector("#css")

html.addEventListener("click",(e)=>{    
    e.preventDefault()
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        let url = tabs[0].url        
        myNewUrl = "https://validator.w3.org/nu/?doc=" + encodeURI(url)
        chrome.tabs.update(tabs[0].id, { url: myNewUrl });
    })
})

css.addEventListener("click",(e)=>{    
    e.preventDefault()
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        let url = tabs[0].url        
        myNewUrl = "https://jigsaw.w3.org/css-validator/validator?uri=" + encodeURI(url) + "&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=en"
        chrome.tabs.update(tabs[0].id, { url: myNewUrl });
    })
})