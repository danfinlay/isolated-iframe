// Imagine this HTML is untrusted code:
const malicious_html = `
  HELLO!
<style>
body {
   background: url("http://www.fillmurray.com/200/300")
}
</style>

`;

window.addEventListener('load', ready)

function ready () {
  injectIframe(malicious_html);
}

function injectIframe (html) {
    var iframe = document.createElement("iframe");
    var img = document.createElement('img');
    img.src = 'http://www.fillmurray.com/200/300'

    container.appendChild(iframe);
    iframe.name = "frame"
    iframe.id = 'test-iframe';
    console.dir(iframe.document)
    console.dir(img)
    injectHTML(iframe, html)
}

// Modified from:
// http://thinkofdev.com/javascript-how-to-load-dynamic-contents-html-string-json-to-iframe/
function injectHTML(iframe, html_string){

    //step 2: obtain the document associated with the frame tag
    //most of the browser supports .document. Some supports (such as the NetScape series) .contentDocumet, while some (e.g. IE5/6) supports .contentWindow.document
    //we try to read whatever that exists.
    var iframedoc = iframe.document;
        if (iframe.contentDocument)
            iframedoc = iframe.contentDocument;
        else if (iframe.contentWindow)
            iframedoc = iframe.contentWindow.document;

     if (iframedoc){
         // Put the content in the iframe
         iframedoc.open();
         iframedoc.writeln(html_string);
         iframedoc.close();
     } else {
        //just in case of browsers that don't support the above 3 properties.
        //fortunately we don't come across such case so far.
        alert('Cannot inject dynamic contents into iframe.');
     }

}
