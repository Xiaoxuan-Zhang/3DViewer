// loads file text
// uses code from Appendix F of Matsuda & Lea

// load text from a file, and calls 'load_handle(file_string)' when done
export default function fileLoader(file_name, load_handle) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 & request.status != 404)
            load_handle(request.responseText);
    }
    request.open('GET', file_name, true);
    request.send();
}

async function asyncfileLoader(filePath) {
  const response = await fetch(filePath);
  const text = await response.text();
  return text;
}

export {
  asyncfileLoader
}
