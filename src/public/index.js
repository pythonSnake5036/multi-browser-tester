var urlElement = document.getElementById("url");

function setUrl() {
  const url = urlElement.value;

  fetch("/seturl", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({url: url})
  });
}
